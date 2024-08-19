const { getFirestore } = require("firebase-admin/firestore");

// General
exports.adminGetDatabaseCount = async (req, res) => {
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

exports.adminGetDatabaseList = async (req, res) => {
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
exports.adminAddTeam = async (req, res) => {
  console.log('In api/admin_add_team...');

  try {
    console.log('Writing team record to firestore database...');
    const payload = req.body;

    const db = getFirestore();
    const docRef = await db.collection(req.body.teamYear).add({
      teamName: payload.teamName,
      registrationFee: payload.registrationFee,
      wristbandFee: payload.wristbandFee,
      numExtraWristbands: payload.numExtraWristbands,
      numAnglers: payload.numAnglers,
      hasSonar: payload.hasSonar,
      hasCheckedIn: payload.hasCheckedIn,
      anglerList: anglerList,
      teamEmail: "admin@gmail.com",
      teamCardholderName: "By Admin",
      teamPhone: "1-555-5555",
      teamPaymentStatus: "By Admin",
      totalFee: "By Admin",
    });


    res.sendStatus(200);
  } catch (error) {
    console.log("Error while writing to firestore db: ", error);
  }
};

exports.adminUpdateTeam = async (req, res) => {
  console.log('In api/admin_update_team...');

  try {
    const db = getFirestore();
    const { teamYear, teamId, teamName, teamEmail, teamPhone, catchYear, anglerYear, hasSonar, hasCheckedIn } = req.body;

    // Get the team document
    const teamDocRef = db.collection(teamYear).doc(teamId);
    const teamDoc = await teamDocRef.get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Update the team document
    await teamDocRef.update({
      teamName: teamName,
      teamEmail: teamEmail,
      teamPhone: teamPhone,
      hasSonar: hasSonar,
      hasCheckedIn: hasCheckedIn
    });

    // Update the team name in all matching catches
    const catchQuerySnapshot = await db.collection(catchYear).where('teamId', '==', teamId).get();
    const catchUpdatePromises = [];
    catchQuerySnapshot.forEach(doc => {
      catchUpdatePromises.push(doc.ref.update({ teamName: teamName }));
    });
    await Promise.all(catchUpdatePromises);

    console.log(`Team ${teamId} updated successfully and associated records updated`);
    res.sendStatus(200);
  } catch (e) {
    console.log("There was an error in update_team...");
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

exports.adminDeleteTeam = async (req, res) => {
  console.log('In api/admin_delete_team...');

  try {
    const db = getFirestore();
    const teamId = req.body.teamId;
    const teamYear = req.body.teamYear;
    const catchYear = req.body.catchYear;

    // Delete the team document
    const teamDocRef = db.collection(teamYear).doc(teamId);
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

// Catches
exports.adminGetCatches = async (req, res) => {
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

exports.adminAddCatch = async (req, res) => {
  console.log('In api/admin_add_catch...');
  const catchData = JSON.parse(req.body.catchData);

  try {
    const db = getFirestore();
    catchData.forEach(async item => {
      await db.collection(req.body.catchYear).add({
        teamId: item.teamId,
        teamName: item.teamName,
        speciesType: item.speciesType,
        species: item.species,
        dateTime: item.dateTime,
        length: item.length,
        girth: item.girth,
        weight: item.weight,
        points: item.points
      });
    });
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

exports.adminUpdateCatch = async (req, res) => {
  console.log('In api/admin_update_catch...');

  try {
    const db = getFirestore();
    await db.collection(req.body.catchYear).doc(req.body.catchId).update({
      dateTime: req.body.dateTime,
      length: req.body.length,
      girth: req.body.girth,
      weight: req.body.weight,
      points: req.body.points
    });

    console.log('Catch ' + req.body.catchId + ' was successfully updated!');
    res.sendStatus(200);
  } catch (e) {
    console.log("There was an error in edit_catch...");
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

exports.adminDeleteCatch = async (req, res) => {
  console.log('In api/admin_delete_catch...');

  try {

    console.log(req.body.catchYear)
    console.log(req.body.catchId)

    const db = getFirestore();
    const documentRef = db.doc(`${req.body.catchYear}/${req.body.catchId}`);
    await documentRef.delete();

    console.log('Catch ' + req.body.catchId + ' was successfully deleted!');
    res.sendStatus(200);
  } catch (e) {
    console.log("There was an error in delete_catch...");
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

