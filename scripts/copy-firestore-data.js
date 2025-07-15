const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin for both environments
let prodApp, stagingApp;

function initializeFirebase() {
  try {
    // Production Firebase App
    const prodServiceAccount = require('./keys/billfish-pachanga-2024-prod-f2137b19898a.json');
    prodApp = admin.initializeApp({
      credential: admin.credential.cert(prodServiceAccount),
      projectId: prodServiceAccount.project_id
    }, 'production');

    // Staging Firebase App
    const stagingServiceAccount = require('./keys/billfish-pachanga-2024-staging-6d8062fd0da0.json');
    stagingApp = admin.initializeApp({
      credential: admin.credential.cert(stagingServiceAccount),
      projectId: stagingServiceAccount.project_id
    }, 'staging');

    console.log('? Firebase apps initialized successfully');
    console.log(`?? Production Project: ${prodServiceAccount.project_id}`);
    console.log(`?? Staging Project: ${stagingServiceAccount.project_id}`);
  } catch (error) {
    console.error('? Error initializing Firebase:', error.message);
    process.exit(1);
  }
}

function getFirestore(appName) {
  const app = appName === 'production' ? prodApp : stagingApp;
  return admin.firestore(app);
}

async function backupCollection(collectionName, backupDir) {
  const stagingDb = getFirestore('staging');

  try {
    const snapshot = await stagingDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`?? No existing data in staging ${collectionName} to backup`);
      return;
    }

    const backupData = {};
    snapshot.forEach(doc => {
      backupData[doc.id] = doc.data();
    });

    const backupFile = path.join(backupDir, `${collectionName}_backup_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`?? Backed up ${snapshot.size} documents from staging ${collectionName} to ${backupFile}`);
  } catch (error) {
    console.error(`? Error backing up ${collectionName}:`, error.message);
    throw error;
  }
}

async function getProductionData(collectionName, limit = null) {
  const prodDb = getFirestore('production');

  try {
    let query = prodDb.collection(collectionName);
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      console.log(`?? No data found in production ${collectionName}`);
      return {};
    }

    const data = {};
    snapshot.forEach(doc => {
      data[doc.id] = doc.data();
    });

    console.log(`?? Retrieved ${snapshot.size} documents from production ${collectionName}`);
    return data;
  } catch (error) {
    console.error(`? Error getting production data from ${collectionName}:`, error.message);
    throw error;
  }
}

async function getProductionDocsByTeam(collectionName, teamIds, limit = null) {
  const prodDb = getFirestore('production');
  const result = {};
  const chunkSize = 10;

  try {
    for (let i = 0; i < teamIds.length; i += chunkSize) {
      const chunk = teamIds.slice(i, i + chunkSize);
      let query = prodDb.collection(collectionName).where('teamId', 'in', chunk);
      if (limit && i === 0) query = query.limit(limit);

      const snapshot = await query.get();
      snapshot.forEach(doc => {
        result[doc.id] = doc.data();
      });
    }

    console.log(`?? Retrieved ${Object.keys(result).length} documents from ${collectionName} for ${teamIds.length} teams`);
    return result;
  } catch (error) {
    console.error(`? Error getting ${collectionName} by team:`, error.message);
    throw error;
  }
}

async function clearStagingCollection(collectionName) {
  const stagingDb = getFirestore('staging');

  try {
    const snapshot = await stagingDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`?? No data to clear in staging ${collectionName}`);
      return;
    }

    const batch = stagingDb.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`?? Cleared ${snapshot.size} documents from staging ${collectionName}`);
  } catch (error) {
    console.error(`? Error clearing staging ${collectionName}:`, error.message);
    throw error;
  }
}

async function copyDataToStaging(collectionName, data) {
  const stagingDb = getFirestore('staging');

  try {
    const docCount = Object.keys(data).length;
    if (docCount === 0) {
      console.log(`?? No data to copy to staging ${collectionName}`);
      return;
    }

    const batchSize = 500;
    const entries = Object.entries(data);

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = stagingDb.batch();
      const batchEntries = entries.slice(i, i + batchSize);

      batchEntries.forEach(([docId, docData]) => {
        const docRef = stagingDb.collection(collectionName).doc(docId);
        batch.set(docRef, docData);
      });

      await batch.commit();
      console.log(`?? Copied batch ${Math.floor(i / batchSize) + 1} (${batchEntries.length} documents) to staging ${collectionName}`);
    }

    console.log(`? Successfully copied ${docCount} documents to staging ${collectionName}`);
  } catch (error) {
    console.error(`? Error copying data to staging ${collectionName}:`, error.message);
    throw error;
  }
}

async function validateCopy(collectionName, originalData) {
  const stagingDb = getFirestore('staging');

  try {
    const snapshot = await stagingDb.collection(collectionName).get();
    const copiedCount = snapshot.size;
    const originalCount = Object.keys(originalData).length;

    if (copiedCount === originalCount) {
      console.log(`? Validation passed: ${copiedCount} documents in staging ${collectionName}`);
      return true;
    } else {
      console.error(`? Validation failed: Expected ${originalCount}, found ${copiedCount} in staging ${collectionName}`);
      return false;
    }
  } catch (error) {
    console.error(`? Error validating ${collectionName}:`, error.message);
    return false;
  }
}

async function performCopy(options = {}) {
  const {
    teamLimit = null,
    catchLimit = null,
    skipBackup = false,
    collections = ['teams2025', 'catches2025', 'pots2025']
  } = options;

  console.log('\n?? Starting Firestore data copy...');
  console.log(`??? Collections to copy: ${collections.join(', ')}`);
  if (teamLimit) console.log(`?? Team limit: ${teamLimit}`);
  if (catchLimit) console.log(`?? Catch limit: ${catchLimit}`);

  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    if (!skipBackup) {
      console.log('\n?? Creating backups of existing staging data...');
      for (const collection of collections) {
        await backupCollection(collection, backupDir);
      }
    }

    // Step 1: Get production teams
    console.log('\n?? Retrieving production team data...');
    const prodTeams = await getProductionData('teams2025', teamLimit);
    const teamIds = Object.keys(prodTeams);

    // Step 2: Get related data
    console.log('\n?? Retrieving dependent production data...');
    const prodCatches = await getProductionDocsByTeam('catches2025', teamIds, catchLimit);
    const prodPots = await getProductionDocsByTeam('pots2025', teamIds);

    // Step 3: Clear staging
    console.log('\n?? Clearing staging collections...');
    for (const collection of collections) {
      await clearStagingCollection(collection);
    }

    // Step 4: Copy data
    console.log('\n?? Copying data to staging...');
    await copyDataToStaging('teams2025', prodTeams);
    await copyDataToStaging('catches2025', prodCatches);
    await copyDataToStaging('pots2025', prodPots);

    // Step 5: Validate
    console.log('\n? Validating copied data...');
    const validTeams = await validateCopy('teams2025', prodTeams);
    const validCatches = await validateCopy('catches2025', prodCatches);
    const validPots = await validateCopy('pots2025', prodPots);

    if (validTeams && validCatches && validPots) {
      console.log('\n?? Data copy completed successfully!');
      console.log(`?? Copied ${Object.keys(prodTeams).length} teams`);
      console.log(`?? Copied ${Object.keys(prodCatches).length} catches`);
      console.log(`?? Copied ${Object.keys(prodPots).length} pots`);
    } else {
      console.log('\n?? Data copy completed with validation errors. Check backups if rollback is needed.');
    }
  } catch (error) {
    console.error('\n? Fatal error during copy process:', error.message);
    console.log('??? Check backups in ./backups/ directory for rollback if needed');
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--team-limit':
        options.teamLimit = parseInt(args[++i]);
        break;
      case '--catch-limit':
        options.catchLimit = parseInt(args[++i]);
        break;
      case '--skip-backup':
        options.skipBackup = true;
        break;
      case '--help':
        console.log(`
Firestore Data Copy Script (Production ? Staging Only)

Usage:
  node copy-firestore-data.js [options]

Options:
  --team-limit <number>   Limit number of teams to copy (for testing)
  --catch-limit <number>  Limit number of catches to copy
  --skip-backup           Skip creating backups of staging data
  --help                  Show this help message

Examples:
  node copy-firestore-data.js --team-limit 10 --catch-limit 20
  node copy-firestore-data.js --skip-backup
        `);
        process.exit(0);
    }
  }

  try {
    initializeFirebase();
    await performCopy(options);
    process.exit(0);
  } catch (error) {
    console.error('? Script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  initializeFirebase,
  performCopy,
  getProductionData,
  copyDataToStaging,
  validateCopy
};
