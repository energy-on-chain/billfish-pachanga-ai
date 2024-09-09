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

module.exports = ({redisClient}) => {

  // General
  const adminGetDatabaseCount = async (req, res) => {
    console.log('In api/admin_get_database_count...');
  
    try {
      let counter = 0;
      const db = getFirestore();
      const snapshot = await db.collection(req.body.tableName).get();
      snapshot.forEach(() => counter++);
      res.json({ "count": counter === 0 ? "TBD" : counter });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };

  const adminGetDatabaseList = async (req, res) => {
    console.log('In api/admin_get_database_list...');
  
    try {
      const db = getFirestore();
      const documentObject = {};
      const snapshot = await db.collection(req.body.table).get();
      snapshot.forEach(document => {
        documentObject[document.id] = document.data();
      });
      res.send(documentObject);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  };
  
  // Teams
  const adminAddTeam = async (req, res) => {
    console.log('In api/admin_add_team...');
  
    try {
      // Parse the metaDataObject from the request body
      console.log(req.body.metaDataObject);
      const parsedMetaData = JSON.parse(req.body.metaDataObject);

      // Flatten specific fields
      const flattenedMetaData = {
        ...flattenObjectWithPrefix(parsedMetaData.requiredDropdownFields, 'requiredDropdownFields'),
        ...flattenObjectWithPrefix(parsedMetaData.nonRequiredStringFields, 'nonRequiredStringFields'),
        ...flattenObjectWithPrefix(parsedMetaData.requiredStringFields, 'requiredStringFields'),
        ...flattenObjectWithPrefix(parsedMetaData.nonRequiredDropdownFields, 'nonRequiredDropdownFields'),
        ...parsedMetaData // Include the rest of the metadata as-is
      };

      // Process image uploads
      console.log("Processing images now...");
      const imageBuffers = {};

      if (req.files.requiredImageUploads) {
        req.files.requiredImageUploads.forEach((element) => {
          imageBuffers[element.originalname] = {
            buffer: element.buffer.toString('base64'), // Convert buffer to base64
            // originalname: element.originalname,
            // fieldname: element.fieldname,
            fieldName: element.fieldName,
            fileName: element.fileName,
            fileExtension: element.fileExtension, 
            mimetype: element.mimetype,
          };
        });
      }
      
      if (req.files.imageUploads) {
        req.files.imageUploads.forEach((element) => {
          imageBuffers[element.originalname] = {
            buffer: element.buffer.toString('base64'), // Convert buffer to base64
            // originalname: element.originalname,
            // fieldname: element.fieldname,
            fieldName: element.fieldName,
            fileName: element.fileName,
            fileExtension: element.fileExtension, 
            mimetype: element.mimetype,
          };
        });
      }

      // Prepare metadata for Firebase
      const metadata = {
        ...parsedMetaData,
        imageBuffers
      };

      // Save the metadata to Firebase and handle images in Google Cloud Storage
      await processAddTeamFirestore(metadata);

      res.status(200).json({ message: "Team added successfully" });
      
    } catch (e) {
      console.error("Error in adminAddTeam:", e);
      res.status(500).json({ error: e.message });
    }
  };

  const processAddTeamFirestore = async (metadata) => {
    console.log('In processAddTeamFirestore() function inside adminAddTeam() creating a new team registration record in firebase...');

    const db = getFirestore();
    const bucket = getStorage().bucket();

    console.log('Metadata:', metadata);

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
    console.log('metadata.imageBuffers:', metadata.imageBuffers);
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
        if (fileData.fieldName === 'requiredImageUploads') {
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
    const teamDocRef = await db.collection(metadata.teamTableName).add({
      teamName: finalMetadata.teamName,
      registrationFee: finalMetadata.registrationFee,
      hasCheckedIn: finalMetadata.hasCheckedIn,
      isEarlybird: finalMetadata.isEarlybird,
      registrationTimestampInLocalTime: new Date().toLocaleString(),
      ...finalMetadata,  // Save all additional fields including flattened fields and image URLs
      teamCardholderName: "Admin",
      teamEmail: "info@customtournamentsolutions.com",
      teamPaymentStatus: "paid",
      teamPhone: "+15555555555",

    });

    // Now add the teamId using the newly created doc number in firebase
    await teamDocRef.update({ teamId: teamDocRef.id });

    console.log('Successfully saved a new team registration record in firebase');
  };

  const adminEditTeam = async (req, res) => {
    console.log('In api/admin_edit_team...');
  
    try {
      const db = getFirestore();
      const bucket = getStorage().bucket();
      const { catchYear, teamId, teamYear, teamName, teamEmail, teamPhone } = req.body;
      let { hasCheckedIn } = req.body;

      // Convert hasCheckedIn back to a boolean
      hasCheckedIn = (hasCheckedIn === 'true');
  
      // Get the team document
      const teamDocRef = db.collection(teamYear).doc(teamId);
      const teamDoc = await teamDocRef.get();
  
      if (!teamDoc.exists) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      const teamData = teamDoc.data();
      const updatedFields = {
        teamName,
        teamEmail,
        teamPhone,
        hasCheckedIn
      };
  
      // Handle image replacements
      const imageBuffers = {};
      const newImageFields = {};

      if (req.files.newImages) {

        req.files.newImages.forEach((element) => {

          // Delete images that have been replaced
          let oldImageUrl = teamData[element.originalname];
          if (oldImageUrl) {
            try {
              // await bucket.file(oldImageUrl).delete();
              const filePath = decodeURIComponent(oldImageUrl.split('/').slice(4).join('/'));
              bucket.file(filePath).delete();
              console.log(`Deleted old image: ${filePath}`);
            } catch (error) {
              console.error(`Error deleting old image: ${oldImageUrl}`, error);
            }
          }

          // Create buffers for new images
          imageBuffers[element.originalname] = {
            buffer: element.buffer.toString('base64'), // Convert buffer to base64
            fieldName: element.originalname,
            mimetype: element.mimetype,
          };

          // Save new images to firebase storage
          for (const [originalname, fileData] of Object.entries(imageBuffers)) {
            const buffer = Buffer.from(fileData.buffer, 'base64');
            const sanitizedFilename = originalname.replace(/\s+/g, '-');
            const filename = `${uuidv4()}-${sanitizedFilename}`;
            const fileUpload = bucket.file(filename);
      
            try {

              // await fileUpload.save(buffer, {
              fileUpload.save(buffer, {
                metadata: {
                  contentType: fileData.mimetype,
                },
              });
      
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
              newImageFields[originalname] = publicUrl;
              console.log(`Stored new image: ${originalname} at URL: ${publicUrl}`);

            } catch (error) {
              console.error(`Error storing image ${originalname}:`, error);
            }
          }

        })
      }

      // Update the team document with the new data and new image URLs
      await teamDocRef.update({
        ...updatedFields,
        ...newImageFields, // Update the document with new image URLs if available
      });

      // Update the team name in all matching catches
      const catchQuerySnapshot = await db.collection(catchYear).where('teamId', '==', teamId).get();
      const catchUpdatePromises = [];
      catchQuerySnapshot.forEach(doc => {
        catchUpdatePromises.push(doc.ref.update({ teamName: teamName }));
      });
      await Promise.all(catchUpdatePromises);
  
      console.log(`Team ${teamId} updated successfully in ${teamYear} collection`);
      res.sendStatus(200);
    } catch (e) {
      console.log("There was an error in admin_edit_team...");
      console.log(e);
      res.status(500).json({ error: e.message });
    }
  };
  
  const adminDeleteTeam = async (req, res) => {
    console.log('In api/admin_delete_team...');
  
    try {
      const db = getFirestore();
      const bucket = getStorage().bucket();
      const teamId = req.body.teamId;
      const teamYear = req.body.teamYear;
      const catchYear = req.body.catchYear;
  
      // Get the team document
      const teamDocRef = db.collection(teamYear).doc(teamId);
      const teamDoc = await teamDocRef.get();
  
      if (!teamDoc.exists) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      const teamData = teamDoc.data();
  
      // Find all image URLs in the team data
      const imageFields = Object.values(teamData).filter(value => typeof value === 'string' && value.startsWith('https://storage.googleapis.com/'));
  
      // Delete each image from Firebase Storage
      const deletePromises = imageFields.map(async (imageUrl) => {
        try {
          // Extract the file path from the URL (remove the "https://storage.googleapis.com/[bucket_name]/")
          const filePath = decodeURIComponent(imageUrl.split('/').slice(4).join('/')); // Decoding the path to handle any URL encoding
          const file = bucket.file(filePath);
          await file.delete();
          console.log(`Deleted image: ${filePath}`);
        } catch (error) {
          console.error(`Error deleting image ${imageUrl}:`, error);
        }
      });
  
      // Wait for all image deletions to complete
      await Promise.all(deletePromises);
  
      // Delete the team document
      await teamDocRef.delete();
      console.log(`Team ${teamId} deleted successfully from ${teamYear} collection`);
  
      // Delete all catches with the specified teamId
      const catchQuerySnapshot = await db.collection(catchYear).where('teamId', '==', teamId).get();
      const catchDeletePromises = [];
      catchQuerySnapshot.forEach(doc => {
        catchDeletePromises.push(doc.ref.delete());
      });
      await Promise.all(catchDeletePromises);
      console.log(`All catches with teamId ${teamId} deleted successfully from ${catchYear} collection`);
  
      res.sendStatus(200);
    } catch (e) {
      console.log("There was an error in delete_team...");
      console.log(e);
      res.status(500).json({ error: e.message });
    }
  }; 
  
  const adminGetRegisteredTeamDataForReport = async (req, res) => {
    console.log('In api/admin_get_registered_team_data_for_report...');
  
    try {
      const db = getFirestore();
      const teamCollection = db.collection(req.body.teamYear);  // Assuming the team year is passed in the request body
      const snapshot = await teamCollection.get();
      
      const teams = {};
      snapshot.forEach(doc => {
        teams[doc.id] = doc.data();  // Collect all team data
      });
  
      res.json(teams);  // Return the team data as JSON
    } catch (error) {
      console.error("Error fetching registered teams:", error);
      res.status(500).json({ error: "Failed to fetch registered team data" });
    }
  };
  
  // Catches
  const adminGetCatches = async (req, res) => {
    console.log('In api/admin_get_catches...');
  
    try {
      const documentObject = {};
      const db = getFirestore();
      const catchesRef = db.collection(req.body.catchYear);
      const snapshot = await catchesRef.get();
      snapshot.forEach(document => {
        documentObject[document.id] = document.data();
      });
      res.send(documentObject);
    } catch (e) {
      console.log('Error getting collection of catches', e);
      res.status(500).json({ error: e.message });
    }
  };

  const adminAddCatch = async (req, res) => {
    console.log('In api/admin_add_catch...');
    
    try {
      const db = getFirestore();
      const bucket = getStorage().bucket();
  
      // Check if catchData is a string and needs parsing
      let catchData = req.body.catchData;
      if (typeof catchData === 'string') {
        catchData = JSON.parse(catchData);
      }
  
      // Loop through each catch entry and handle both data and files
      const catchPromises = catchData.map(async (item, index) => {
        // If there's an uploaded file, handle it
        let catchPhotoUrl = null;
        
        // Loop through req.files to find the matching file based on fieldname
        const file = req.files.find(file => file.fieldname === `catchPhoto_${index}`);

        if (file) {
          console.log('There is a file!', file);
          const filename = `${uuidv4()}-${file.originalname}`;  // Generate unique filename
          const fileUpload = bucket.file(filename);

          // Upload the file to Firebase Storage
          await fileUpload.save(file.buffer, {
            metadata: { contentType: file.mimetype },
          });

          // Get the public URL for the uploaded image
          catchPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        }
  
        // Save catch data to Firestore, including the catch photo URL if applicable
        const catchDocRef = await db.collection(req.body.catchYear).add({
          teamId: item.teamId,
          teamName: item.teamName,
          speciesType: item.speciesType,
          species: item.species,
          dateTime: item.dateTime,
          length: item.length,
          girth: item.girth,
          weight: item.weight,
          points: item.points,
          catchPhoto: catchPhotoUrl,  // Save the image URL here
        });
  
        // Update the document with its unique ID
        await catchDocRef.update({ catchId: catchDocRef.id });
      });
  
      // Wait for all catch documents to be saved
      await Promise.all(catchPromises);
  
      res.sendStatus(200);
    } catch (e) {
      console.error('Error in adminAddCatch:', e);
      res.status(500).json({ error: e.message });
    }
  };
  
  const adminEditCatch = async (req, res) => {
    console.log('In api/admin_edit_catch...');
    console.log('req.files', req.files);
  
    try {
      const db = getFirestore();
      const bucket = getStorage().bucket();
  
      // Get the current catch document
      const catchDocRef = db.collection(req.body.catchYear).doc(req.body.catchId);
      const catchDoc = await catchDocRef.get();
  
      if (!catchDoc.exists) {
        return res.status(404).json({ error: 'Catch not found' });
      }
  
      const catchData = catchDoc.data();
      let catchPhotoUrl = catchData.catchPhoto; // Keep the current photo URL
  
      // Handle image replacement if a new file is provided
      if (req.files && req.files.length > 0) {
        // Get the file from the request (assuming one image per catch)
        const file = req.files[0];
  
        if (file) {
          console.log('Replacing existing catch photo with new file:', file.originalname);
  
          // Delete the old image from Firebase Storage
          if (catchPhotoUrl) {
            try {
              const filePath = decodeURIComponent(catchPhotoUrl.split('/').slice(4).join('/'));
              await bucket.file(filePath).delete();
              console.log(`Deleted old catch photo: ${filePath}`);
            } catch (error) {
              console.error(`Error deleting old catch photo: ${catchPhotoUrl}`, error);
            }
          }
  
          // Upload the new image to Firebase Storage
          const filename = `${uuidv4()}-${file.originalname}`;
          const fileUpload = bucket.file(filename);
          await fileUpload.save(file.buffer, {
            metadata: { contentType: file.mimetype },
          });
  
          // Update the `catchPhotoUrl` with the new file's public URL
          catchPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          console.log(`Uploaded new catch photo: ${catchPhotoUrl}`);
        }
      }
  
      // Update the catch document in Firestore with the new data and image URL
      await catchDocRef.update({
        dateTime: req.body.dateTime,
        length: req.body.length,
        girth: req.body.girth,
        weight: req.body.weight,
        points: req.body.points,
        catchPhoto: catchPhotoUrl,  // Update the catchPhoto URL
      });
  
      console.log('Catch ' + req.body.catchId + ' was successfully updated with new data!');
      res.sendStatus(200);
    } catch (e) {
      console.log("There was an error in edit_catch...");
      console.log(e);
      res.status(500).json({ error: e.message });
    }
  };
  
  const adminDeleteCatch = async (req, res) => {
    console.log('In api/admin_delete_catch...');
  
    try {
      const db = getFirestore();
      const bucket = getStorage().bucket();
      const catchId = req.body.catchId;
      const catchYear = req.body.catchYear;
  
      // Get the team document
      const catchDocRef = db.collection(catchYear).doc(catchId);
      const catchDoc = await catchDocRef.get();

      if (!catchDoc.exists) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      const catchData = catchDoc.data();
  
      // Find all image URLs in the team data
      const imageFields = Object.values(catchData).filter(value => typeof value === 'string' && value.startsWith('https://storage.googleapis.com/'));
  
      // Delete each image from Firebase Storage
      const deletePromises = imageFields.map(async (imageUrl) => {
        try {
          // Extract the file path from the URL (remove the "https://storage.googleapis.com/[bucket_name]/")
          const filePath = decodeURIComponent(imageUrl.split('/').slice(4).join('/')); // Decoding the path to handle any URL encoding
          const file = bucket.file(filePath);
          await file.delete();
          console.log(`Deleted image: ${filePath}`);
        } catch (error) {
          console.error(`Error deleting image ${imageUrl}:`, error);
        }
      });
  
      // Wait for all image deletions to complete
      await Promise.all(deletePromises);
  
      // Now delete the catch from the database
      await catchDocRef.delete();
  
      console.log('Catch ' + req.body.catchId + ' was successfully deleted!');
      res.sendStatus(200);
    } catch (e) {
      console.log("There was an error in delete_catch...");
      console.log(e);
      res.status(500).json({ error: e.message });
    }
  };

  const adminGetTotalCatchCount = async (req, res) => {
    console.log('In api/admin_get_total_catch_count...');
    
    try {
      const db = getFirestore();
      const catchYear = req.body.catchYear;
      
      // Get all documents in the collection
      const snapshot = await db.collection(catchYear).get();
      
      const totalFishCount = snapshot.size;  // Total number of documents
      res.status(200).json({ totalFishCount });
      
    } catch (error) {
      console.error("Error getting total fish count:", error);
      res.status(500).json({ error: "Failed to get total fish count" });
    }
  };

  const adminGetTotalCatchCountBySpecies = async (req, res) => {
    console.log('In api/admin_get_total_catch_count_by_species...');
    
    try {
      const db = getFirestore();
      const catchYear = req.body.catchYear;
      const speciesType = req.body.speciesType;  // Pass the species type
  
      // Query to get documents where the speciesType matches
      const snapshot = await db.collection(catchYear).where("speciesType", "==", speciesType).get();
      
      const speciesCount = snapshot.size;  // Number of matching documents
      res.status(200).json({ speciesCount });
      
    } catch (error) {
      console.error("Error getting fish count by species:", error);
      res.status(500).json({ error: "Failed to get fish count by species" });
    }
  };

  // Announcements
  const adminAddAnnouncement = async (req, res) => {
    try {
      const db = getFirestore();
      const { newAnnouncement, announcementYear } = req.body;
  
      const announcementRef = await db.collection(announcementYear).add(newAnnouncement);
      await announcementRef.update({ announcementId: announcementRef.id });
  
      res.status(200).json({ message: 'Announcement added successfully' });
    } catch (error) {
      console.error('Error adding announcement:', error);
      res.status(500).json({ error: 'Error adding announcement' });
    }
  };
  
  const adminEditAnnouncement = async (req, res) => {
    try {
      console.log("Request Body:", req.body); // Log the request body to verify it's correct
  
      const db = getFirestore();
      const { updatedAnnouncement, announcementYear } = req.body;
      const { announcementId } = updatedAnnouncement;
  
      if (!announcementId) {
        return res.status(400).json({ error: 'Announcement ID is missing' });
      }
  
      const announcementRef = db.collection(announcementYear).doc(announcementId);
      await announcementRef.update(updatedAnnouncement);
  
      res.status(200).json({ message: 'Announcement updated successfully' });
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ error: 'Error updating announcement' });
    }
  };
  
  const adminDeleteAnnouncement = async (req, res) => {
    try {
      const db = getFirestore();
      const { announcementId, announcementYear } = req.body;
  
      const announcementRef = db.collection(announcementYear).doc(announcementId);
      await announcementRef.delete();
  
      res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({ error: 'Error deleting announcement' });
    }
  };  

  return {
    adminGetDatabaseCount,
    adminGetDatabaseList,
    adminAddTeam,
    adminEditTeam,
    adminDeleteTeam,
    adminGetCatches,
    adminAddCatch,
    adminEditCatch,
    adminDeleteCatch,
    adminAddAnnouncement,
    adminEditAnnouncement,
    adminDeleteAnnouncement,
    adminGetTotalCatchCount,
    adminGetTotalCatchCountBySpecies,
    adminGetRegisteredTeamDataForReport,
    upload
  };

};
