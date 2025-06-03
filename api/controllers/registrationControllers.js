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
      console.log('=== WEBHOOK START ===');
      console.log('Timestamp:', new Date().toISOString());

      const payload = req.rawBody.toString();
      const sig = req.headers['stripe-signature'];

      let event;
      try {
          event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
          console.log('? Successfully created webhook event!');
          console.log('Event type:', event.type);
      } catch (err) {
          console.error('? Webhook signature verification failed:', err.message);
          return res.status(400).send(`Error while attempting to create webhook event: ${err.message}`);
      }

      // Send an immediate response to Stripe
      res.status(200).end();

      if (event.type === 'checkout.session.completed') {
          const metadataKey = event.data.object.metadata.metadataKey;
          console.log('?? Processing checkout.session.completed for metadataKey:', metadataKey);
          console.log('?? Amount total:', event.data.object.amount_total);
          console.log('?? Customer email:', event.data.object.customer_details?.email);

          try {
              // Step 1: Retrieve metadata from Redis
              console.log('?? Attempting to retrieve metadata from Redis...');
              const storedMetadata = await redisClient.get(metadataKey);
              
              if (!storedMetadata) {
                  console.error('? No metadata found in Redis for key:', metadataKey);
                  return;
              }

              console.log('? Retrieved metadata from Redis successfully');
              const metadata = JSON.parse(storedMetadata);
              console.log('?? Metadata team name:', metadata.teamName);

              // Step 2: Process Firestore operations
              console.log('?? Starting Firestore operations...');
              await processFirestore(metadata, event.data.object);
              console.log('? Successfully processed Firestore operations');

              // Step 3: Clear Redis
              console.log('?? Clearing metadata from Redis...');
              await redisClient.del(metadataKey);
              console.log('? Cleared metadata from Redis');

              console.log('?? WEBHOOK COMPLETED SUCCESSFULLY');

          } catch (error) {
              console.error("? ERROR in webhook processing:");
              console.error("Error name:", error.name);
              console.error("Error message:", error.message);
              console.error("Error stack:", error.stack);
              console.error("Error code:", error.code);
              
              // Don't delete the Redis key if there was an error, so we can retry
              console.log('?? Keeping Redis data for potential retry due to error');
          }
      }

      console.log('=== WEBHOOK END ===');
  };

  const processFirestore = async (metadata, stripeEventData) => {
      console.log('?? === FIRESTORE PROCESSING START ===');

      try {
          // Step 1: Initialize Firebase services
          console.log('?? Initializing Firebase services...');
          const db = getFirestore();
          const bucket = getStorage().bucket();
          console.log('? Firebase services initialized');

          // Step 2: Extract customer details
          console.log('?? Extracting customer details...');
          const customerDetails = stripeEventData.customer_details || {};
          const email = customerDetails.email || null;
          const name = customerDetails.name || null;
          const phone = customerDetails.phone || null;

          if (!email) {
              throw new Error("Customer email is missing in the Stripe event data.");
          }
          console.log('? Customer details extracted:', { email, name, phone });

          // Step 3: Process add-ons
          console.log('?? Processing add-ons...');
          const combinedAddOns = {};
          if (metadata.addOnProperties) {
              for (const [addOn, properties] of Object.entries(metadata.addOnProperties)) {
                  const quantityPurchased = metadata.addOnQuantities?.[addOn] || 0;
                  combinedAddOns[addOn] = {
                      ...properties,
                      quantityPurchased,
                      costOfPurchase: quantityPurchased * properties.price,
                  };
              }
          }
          console.log('? Add-ons processed:', Object.keys(combinedAddOns));

          // Step 4: Flatten fields
          console.log('?? Flattening form fields...');
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
          console.log('? Fields flattened, count:', Object.keys(flattenedFields).length);

          // Step 5: Process images
          console.log('??? Processing image uploads...');
          const requiredImageFields = {};
          const nonRequiredImageFields = {};

          if (metadata.imageBuffers && Object.keys(metadata.imageBuffers).length > 0) {
              console.log('?? Found', Object.keys(metadata.imageBuffers).length, 'images to process');
              
              for (const [originalname, fileData] of Object.entries(metadata.imageBuffers)) {
                  console.log('?? Uploading image:', originalname);
                  
                  try {
                      const buffer = Buffer.from(fileData.buffer, 'base64');
                      const sanitizedFilename = originalname.replace(/\s+/g, '-');
                      const filename = `${uuidv4()}-${sanitizedFilename}`;
                      const fileUpload = bucket.file(filename);

                      await fileUpload.save(buffer, {
                          metadata: {
                              contentType: fileData.mimetype,
                          },
                      });

                      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

                      if (fileData.fieldname === 'requiredImageUploads') {
                          requiredImageFields[originalname] = publicUrl;
                      } else {
                          nonRequiredImageFields[originalname] = publicUrl;
                      }

                      console.log('? Image uploaded successfully:', originalname);
                  } catch (imageError) {
                      console.error('? Error uploading image:', originalname, imageError.message);
                      throw new Error(`Image upload failed for ${originalname}: ${imageError.message}`);
                  }
              }
          } else {
              console.log('?? No images to process');
          }

          // Step 6: Prepare final metadata
          console.log('?? Preparing final metadata...');
          const finalMetadata = {
              ...flattenedFields,
              ...metadata,
          };

          // Add image URLs
          Object.assign(finalMetadata, requiredImageFields, nonRequiredImageFields);

          // Add add-on data
          Object.assign(finalMetadata, combinedAddOns);

          // Clean up unwanted fields
          const fieldsToDelete = [
              'requiredStringFields', 'requiredIntFields', 'requiredBooleanFields', 'requiredDropdownFields',
              'nonRequiredStringFields', 'nonRequiredIntFields', 'nonRequiredBooleanFields', 'nonRequiredDropdownFields',
              'imageBuffers', 'addOnQuantities', 'teamTableName', 'addOnProperties'
          ];
          
          fieldsToDelete.forEach(field => delete finalMetadata[field]);
          console.log('? Metadata prepared');

          // Step 7: Save to Firestore
          console.log('?? Saving to Firestore...');
          const teamData = {
              teamName: finalMetadata.teamName,
              registrationFee: finalMetadata.registrationFee,
              totalFeePaidAtCheckout: stripeEventData.amount_total / 100,
              hasCheckedIn: finalMetadata.hasCheckedIn || false,
              isEarlybird: finalMetadata.isEarlybird || false,
              registrationTimestampInLocalTime: new Date().toLocaleString(),
              teamEmail: email,
              teamCardholderName: name,
              teamPhone: phone,
              teamPaymentStatus: stripeEventData.payment_status,
              ...finalMetadata,
          };

          console.log('??? Attempting to write to collection: teams' + finalMetadata.year);
          const teamDocRef = await db.collection(`teams${finalMetadata.year}`).add(teamData);
          console.log('? Document created with ID:', teamDocRef.id);

          // Step 8: Update with teamId
          console.log('?? Updating document with teamId...');
          await teamDocRef.update({ teamId: teamDocRef.id });
          console.log('? Document updated with teamId');

          console.log('?? FIRESTORE PROCESSING COMPLETED SUCCESSFULLY');

      } catch (error) {
          console.error('? FIRESTORE PROCESSING ERROR:');
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          console.error('Error code:', error.code);
          
          // Re-throw the error to be caught by the webhook handler
          throw error;
      }
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

