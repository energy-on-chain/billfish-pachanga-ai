const { getFirestore } = require("firebase-admin/firestore");

exports.getRegistrantCountForHomepage = async (req, res) => {
  console.log('In api/get_registrant_count_for_homepage...');

  try {
    const year = req.params.year;

    let counter = 0;
    const db = getFirestore();
    const snapshot = await db.collection(`teams${year}`).get(); 

    // Count number of teams
    snapshot.forEach(() => counter++);
    
    res.json({ "count": counter });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }

};

exports.getCatchCountForHomepage = async (req, res) => {
  console.log('In api/get_catch_count_for_homepage...');

  try {
    const year = req.params.year;
    
    let counter = 0;
    const db = getFirestore();
    const { catchesTableName, speciesTypeList } = req.body;

    // Get all catches from the specified table
    const snapshot = await db.collection(`catches${year}`).get();

    // Filter catches based on speciesType
    snapshot.forEach(doc => {
      const data = doc.data();
      if (speciesTypeList.includes(data.speciesType)) {
        counter++;
      }
    });

    res.json({ count: counter });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


