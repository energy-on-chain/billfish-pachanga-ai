const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

// Helpers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

const flattenObjectWithPrefix = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(acc, flattenObjectWithPrefix(obj[k], pre + k));
    } else {
      acc[pre + k] = String(obj[k]); // Convert both keys and values to strings
    }
    return acc;
  }, {});
};

// Endpoints
module.exports = ({ clientUrl, serverUrl, stripe, webhookSecret, redisClient }) => {

  const registrationGetPastTeamNameList = async (req, res) => {
    console.log('In api/registration_get_past_team_name_list...');
 
    try {
      const year = req.params.year;
      const db = getFirestore();
      const { teamTableNameList } = req.body; // Expecting an array of table names
      let allTeamNames = new Set();

      for (const tableName of teamTableNameList) {
        const snapshot = await db.collection(tableName).get();
        snapshot.forEach(doc => {
          allTeamNames.add(doc.data().teamName);
        });
      }

      // Convert Set to array and send response
      res.json({ teamNames: Array.from(allTeamNames) });
    } catch (error) {
      console.error("Error fetching past team names: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const registrationCheckoutSession = async (req, res) => {
    console.log('In api/registration_checkout_session...');
  
    try {
      const year = req.params.year;
      // Parse the metaDataObject from the request body
      const parsedMetaData = JSON.parse(req.body.metaDataObject);
  
      // Flatten specific fields
      const flattenedMetaData = {
        ...flattenObjectWithPrefix(parsedMetaData.requiredDropdownFields, 'requiredDropdownFields'),
        ...flattenObjectWithPrefix(parsedMetaData.nonRequiredStringFields, 'nonRequiredStringFields'),
        ...flattenObjectWithPrefix(parsedMetaData.requiredStringFields, 'requiredStringFields'),
        ...flattenObjectWithPrefix(parsedMetaData.nonRequiredDropdownFields, 'nonRequiredDropdownFields'),
        ...parsedMetaData // Include the rest of the metadata as-is
      };
  
      // Store flattened metadata and image data (buffers) in Redis
      const metadataKey = `metadata:${uuidv4()}`;
  
      // Process image uploads
      console.log("Processing images now...")
      const imageBuffers = {};

      if (req.files.requiredImageUploads) {
        req.files.requiredImageUploads.forEach((element, index) => {
          imageBuffers[element.originalname] = {
            buffer: element.buffer.toString('base64'), // Convert buffer to base64
            originalname: element.originalname,
            fieldname: element.fieldname,
            mimetype: element.mimetype,
          };
        });
      }
      
      if (req.files.imageUploads) {
        req.files.imageUploads.forEach((element, index) => {
          imageBuffers[element.originalname] = {
            buffer: element.buffer.toString('base64'), // Convert buffer to base64
            originalname: element.originalname,
            fieldname: element.fieldname,
            mimetype: element.mimetype,
          };
        });
      }
  
      await redisClient.set(metadataKey, JSON.stringify({
        ...parsedMetaData,
        imageBuffers,
        year: `${year}`
      }));
  
      // Define line items for registration and add-ons
      let lineItems = [];
  
      // Add team registration fee as the first line item
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: parsedMetaData.isEarlybird ? "Team Registration (Earlybird)" : "Team Registration"
          },
          unit_amount: parseInt(parsedMetaData.registrationFee) * 100
        },
        quantity: 1,
      });
  
      // Add line items for each add-on
      const addOnQuantities = parsedMetaData.addOnQuantities || {};
      const addOnPrices = parsedMetaData.addOnProperties;
  
      for (const [addOn, quantity] of Object.entries(addOnQuantities)) {
        if (quantity > 0 && addOnPrices[addOn]) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: addOn
              },
              unit_amount: addOnPrices[addOn].price * 100 // Assuming price is in dollars
            },
            quantity: quantity,
          });
        }
      }
  
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        phone_number_collection: { enabled: true },
        line_items: lineItems,
        metadata: { metadataKey }, // Store the Redis key in Stripe's metadata
        success_url: `${clientUrl}/${year}/registration_success`,
        cancel_url: `${clientUrl}/${year}/registration_error`
      });
  
      res.json({ url: session.url });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };  

  const registrationWebhook = async (req, res) => {
    console.log('In api/registrationWebhook...');

    const payload = req.rawBody.toString();
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        console.log('Successfully created webhook event!');
    } catch (err) {
        console.log(err);
        return res.status(400).send(`Error while attempting to create webhook event: ${err.message}`);
    }

    // Send an immediate response to Stripe
    res.status(200).end();

    if (event.type === 'checkout.session.completed') {
        const metadataKey = event.data.object.metadata.metadataKey;

        // Retrieve metadata from Redis
        const storedMetadata = await redisClient.get(metadataKey);
        const metadata = JSON.parse(storedMetadata);

        // Perform Firestore operations asynchronously
        processFirestore(metadata, event.data.object).catch(error => {
            console.log("Error while trying to write to Firestore: ", error);
        });

        // Optionally clear the stored metadata in Redis after processing
        await redisClient.del(metadataKey);
    }
  };

  const processFirestore = async (metadata, stripeEventData) => {
    console.log('In processFirestore() function inside registrationWebhook() creating a new team registration record in firebase...');

    const db = getFirestore();
    const bucket = getStorage().bucket();

    console.log('Metadata:', metadata);

    const customerDetails = stripeEventData.customer_details || {};
    const email = customerDetails.email || null;
    const name = customerDetails.name || null;
    const phone = customerDetails.phone || null;

    if (!email) {
        throw new Error("Customer email is missing in the Stripe event data.");
    }

    // Combine addOnProperties and addOnQuantities and add costOfPurchase
    const combinedAddOns = {};
    for (const [addOn, properties] of Object.entries(metadata.addOnProperties)) {
        const quantityPurchased = metadata.addOnQuantities[addOn] || 0;
        combinedAddOns[addOn] = {
            ...properties,
            quantityPurchased,
            costOfPurchase: quantityPurchased * properties.price, // Calculate cost of purchase
        };
    }

    // Flatten required and non-required fields
    const flattenedFields = {
        ...metadata.requiredStringFields,
        ...metadata.requiredIntFields,
        ...metadata.requiredBooleanFields,
        ...metadata.requiredDropdownFields,
        ...metadata.nonRequiredStringFields,
        ...metadata.nonRequiredIntFields,
        ...metadata.nonRequiredBooleanFields,
        ...metadata.nonRequiredDropdownFields,
    };

    // Handle image uploads using imported field names
    const requiredImageFields = {};
    const nonRequiredImageFields = {};

    // Handle required image uploads
    console.log('metadata.imageBuffers:', metadata.imageBuffers)
    for (const [originalname, fileData] of Object.entries(metadata.imageBuffers)) {
      const buffer = Buffer.from(fileData.buffer, 'base64');
      const sanitizedFilename = originalname.replace(/\s+/g, '-');
      const filename = `${uuidv4()}-${sanitizedFilename}`;
      const fileUpload = bucket.file(filename);

      try {
          await fileUpload.save(buffer, {
              metadata: {
                  contentType: fileData.mimetype,
              },
          });

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

          // Determine if the image is required or non-required based on fieldname
          if (fileData.fieldname === 'requiredImageUploads') {
              requiredImageFields[originalname] = publicUrl;
              console.log(`Stored required image: ${originalname} at URL: ${publicUrl}`);
          } else {
              nonRequiredImageFields[originalname] = publicUrl;
              console.log(`Stored non-required image: ${originalname} at URL: ${publicUrl}`);
          }
      } catch (error) {
          console.error(`Error storing image ${originalname}:`, error);
      }
    }

    // Prepare final metadata without nested objects and without imageBuffers
    const finalMetadata = {
        ...flattenedFields,
        ...metadata, // This still includes non-nested properties like teamTableName, teamName, etc.
    };

    // Separate each required and non-required image field into its own field
    for (const [imageName, imageUrl] of Object.entries(requiredImageFields)) {
      finalMetadata[imageName] = imageUrl;
    }

    for (const [imageName, imageUrl] of Object.entries(nonRequiredImageFields)) {
      finalMetadata[imageName] = imageUrl;
    }

    // Separate each addOnCharge into its own field
    for (const [addOn, addOnData] of Object.entries(combinedAddOns)) {
      finalMetadata[addOn] = addOnData;
    }

    // Exclude original `required...`, `nonRequired...`, `imageBuffers`, and `addOnQuantities`
    delete finalMetadata.requiredStringFields;
    delete finalMetadata.requiredIntFields;
    delete finalMetadata.requiredBooleanFields;
    delete finalMetadata.requiredDropdownFields;
    delete finalMetadata.nonRequiredStringFields;
    delete finalMetadata.nonRequiredIntFields;
    delete finalMetadata.nonRequiredBooleanFields;
    delete finalMetadata.nonRequiredDropdownFields;
    delete finalMetadata.imageBuffers;
    delete finalMetadata.addOnQuantities;
    delete finalMetadata.teamTableName;
    delete finalMetadata.addOnProperties;

    // Add the team document and get the document reference
    const teamDocRef = await db.collection(`teams${finalMetadata.year}`).add({
        teamName: finalMetadata.teamName,
        registrationFee: finalMetadata.registrationFee,
        hasCheckedIn: finalMetadata.hasCheckedIn,
        isEarlybird: finalMetadata.isEarlybird,
        registrationTimestampInLocalTime: new Date().toLocaleString(),
        teamEmail: email,
        teamCardholderName: name,
        teamPhone: phone,
        teamPaymentStatus: stripeEventData.payment_status,
        ...finalMetadata,  // Save all additional fields including flattened fields and image URLs
    });

    // Now add the teamId using the newly created doc number in firebase
    await teamDocRef.update({ teamId: teamDocRef.id });

    console.log('Successfully saved a new team registration record in firebase');
};

  const registrationGetNumberOfRegisteredTeams = async (req, res) => {
    try {
      const year = req.params.year;
      const db = getFirestore();
      const snapshot = await db.collection(`teams${year}`).get();
      const totalTeams = snapshot.size; // Count the number of documents
      res.json({ totalTeams });
    } catch (error) {
      console.error("Error fetching total registered teams: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const registrationGetNumberOfCheckedInTeams = async (req, res) => {
    try {
      const year = req.params.year;
      const db = getFirestore();
      const snapshot = await db.collection(`teams${year}`).where('hasCheckedIn', '==', true).get();
      const checkedInTeams = snapshot.size; // Count the number of documents where hasCheckedIn is true
      res.json({ checkedInTeams });
    } catch (error) {
      console.error("Error fetching checked-in teams: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const registrationGetTotalFeesCollected = async (req, res) => {
    try {
      const year = req.params.year;
      const db = getFirestore();
      const snapshot = await db.collection(`teams${year}`).get();
  
      let totalFees = 0;
      snapshot.forEach(doc => {
        totalFees += doc.data().totalFeePaidAtCheckout || 0;
      });
  
      res.json({ totalFees });
    } catch (error) {
      console.error("Error fetching total fees collected: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const registrationGetTotalRegistrationFeesCollected = async (req, res) => {
    try {
      const year = req.params.year;
      const db = getFirestore();
      const snapshot = await db.collection(`teams${year}`).get();
  
      let totalRegistrationFees = 0;
      snapshot.forEach(doc => {
        totalRegistrationFees += doc.data().registrationFee || 0;
      });
  
      res.json({ totalRegistrationFees });
    } catch (error) {
      console.error("Error fetching total registration fees collected: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const registrationGetTotalAddOnFeesCollected = async (req, res) => {
    try {
      const year = req.params.year;
      const db = getFirestore();
      const snapshot = await db.collection(`teams${year}`).get();
  
      let totalAddOnFees = 0;
      snapshot.forEach(doc => {
        const addOns = doc.data();
        Object.keys(addOns).forEach(key => {
          if (addOns[key] && addOns[key].costOfPurchase) {
            totalAddOnFees += addOns[key].costOfPurchase;
          }
        });
      });
  
      res.json({ totalAddOnFees });
    } catch (error) {
      console.error("Error fetching total add-on fees collected: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  return {
    registrationGetPastTeamNameList,
    registrationCheckoutSession,
    registrationWebhook,
    registrationGetNumberOfRegisteredTeams,
    registrationGetNumberOfCheckedInTeams,
    registrationGetTotalFeesCollected,
    registrationGetTotalRegistrationFeesCollected,
    registrationGetTotalAddOnFeesCollected,
    upload
  };
};

