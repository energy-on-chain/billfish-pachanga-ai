/**
 * migrate-to-new-projects.js
 *
 * Migrates Firestore data from the OLD 2024/2025 Firebase projects into the NEW
 * 2026 Firebase projects (staging and/or production).
 *
 * OLD projects (source):
 *   Prod:     billfish-pachanga-2024-prod  (contains 2023, 2024, and 2025 data)
 *   Staging:  billfish-pachanga-2024-staging
 *
 * NEW projects (destination):
 *   Staging:  white-feat-490620-j0       (billfish-pachanga-ai-dev)
 *   Prod:     billfish-pachanga-ai-prod
 *
 * SOURCE credentials: JSON key files placed in scripts/keys/
 *   scripts/keys/old-prod.json      — old production service account
 *   scripts/keys/old-staging.json   — old staging service account (optional)
 *
 * DESTINATION credentials: loaded from root .env (same vars used by server.js)
 *
 * Usage:
 *   node scripts/migrate-to-new-projects.js [options]
 *
 * Options:
 *   --source <prod|staging>         Which OLD project to read from (default: prod)
 *   --dest   <staging|production>   Which NEW project to write to  (default: staging)
 *   --collections <c1,c2,...>       Comma-separated list (default: all — see COLLECTIONS)
 *   --dry-run                       Read source data only, no writes
 *   --skip-backup                   Skip backing up destination before writing
 *   --team-limit <n>                Limit number of teams (for quick smoke-test)
 *   --help
 *
 * Examples:
 *   # Migrate everything from old prod → new staging (recommended first step)
 *   node scripts/migrate-to-new-projects.js --source prod --dest staging
 *
 *   # Quick smoke-test with 5 teams
 *   node scripts/migrate-to-new-projects.js --source prod --dest staging --team-limit 5
 *
 *   # Dry run to verify counts before writing
 *   node scripts/migrate-to-new-projects.js --source prod --dest staging --dry-run
 *
 *   # Only migrate 2025 data
 *   node scripts/migrate-to-new-projects.js --source prod --dest staging --collections teams2025,catches2025,pots2025
 *
 *   # Once satisfied, push to new production
 *   node scripts/migrate-to-new-projects.js --source prod --dest production
 */

const path = require('path');
const fs = require('fs');

// All deps via api/node_modules — no separate install needed
const admin = require(path.join(__dirname, '../api/node_modules/firebase-admin'));
require(path.join(__dirname, '../api/node_modules/dotenv')).config({
  path: path.join(__dirname, '../.env'),
});

// ─── Collections to migrate ───────────────────────────────────────────────────
const ALL_COLLECTIONS = [
  'teams2023',
  'catches2023',
  'pots2023',
  'teams2024',
  'catches2024',
  'pots2024',
  'teams2025',
  'catches2025',
  'pots2025',
];

// ─── Firebase init ────────────────────────────────────────────────────────────

let sourceApp = null;
let destApp = null;

function initSource(sourceEnv) {
  const keyFile = path.join(
    __dirname,
    'keys',
    sourceEnv === 'prod' ? 'old-prod.json' : 'old-staging.json'
  );

  if (!fs.existsSync(keyFile)) {
    console.error(`\nERROR: Source key file not found: ${keyFile}`);
    console.error(
      `\nPlease download a service account key for the OLD ${sourceEnv} Firebase project and save it as:\n  ${keyFile}\n`
    );
    console.error(
      'In the Firebase Console: Project Settings → Service accounts → Generate new private key'
    );
    process.exit(1);
  }

  const serviceAccount = require(keyFile);
  sourceApp = admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    },
    'source'
  );

  console.log(`  Source project : ${serviceAccount.project_id}`);
}

function initDest(destEnv) {
  const envSuffix = destEnv === 'production' ? 'PRODUCTION' : 'STAGING';

  const requiredVars = [
    `REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_${envSuffix}`,
    `REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_${envSuffix}`,
    `REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_${envSuffix}`,
    `REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_${envSuffix}`,
  ];

  for (const v of requiredVars) {
    if (!process.env[v]) {
      console.error(`\nERROR: Missing environment variable: ${v}`);
      console.error('Make sure the root .env file is populated with the new Firebase credentials.');
      process.exit(1);
    }
  }

  const credential = {
    type: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_${envSuffix}`],
    project_id: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_${envSuffix}`],
    private_key_id: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_${envSuffix}`],
    private_key: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_${envSuffix}`].replace(/\\n/g, '\n'),
    client_email: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_${envSuffix}`],
    client_id: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_${envSuffix}`],
    auth_uri: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_${envSuffix}`],
    token_uri: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_${envSuffix}`],
    auth_provider_x509_cert_url: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_${envSuffix}`],
    client_x509_cert_url: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_${envSuffix}`],
    universe_domain: process.env[`REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_${envSuffix}`] || 'googleapis.com',
  };

  destApp = admin.initializeApp(
    {
      credential: admin.credential.cert(credential),
      projectId: credential.project_id,
    },
    'dest'
  );

  console.log(`  Dest project   : ${credential.project_id}`);
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

function sourceDb() {
  return admin.firestore(sourceApp);
}

function destDb() {
  return admin.firestore(destApp);
}

async function readCollection(collectionName, limitTeams = null) {
  const db = sourceDb();
  let query = db.collection(collectionName);
  if (limitTeams && collectionName.startsWith('teams')) {
    query = query.limit(limitTeams);
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    console.log(`    [source] ${collectionName}: empty (0 docs)`);
    return {};
  }

  const data = {};
  snapshot.forEach((doc) => {
    data[doc.id] = doc.data();
  });
  console.log(`    [source] ${collectionName}: ${snapshot.size} docs`);
  return data;
}

async function readCatchesForTeams(teamIds) {
  const db = sourceDb();
  const result = {};
  const chunkSize = 10;

  for (let i = 0; i < teamIds.length; i += chunkSize) {
    const chunk = teamIds.slice(i, i + chunkSize);
    const snapshot = await db.collection('catches2024').where('teamId', 'in', chunk).get();
    snapshot.forEach((doc) => {
      result[doc.id] = doc.data();
    });
  }
  return result;
}

async function backupCollection(collectionName, backupDir) {
  const db = destDb();
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`    [backup] ${collectionName}: nothing to back up`);
    return;
  }

  const backupData = {};
  snapshot.forEach((doc) => {
    backupData[doc.id] = doc.data();
  });

  const backupFile = path.join(backupDir, `${collectionName}_backup_${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`    [backup] ${collectionName}: ${snapshot.size} docs → ${backupFile}`);
}

async function writeCollection(collectionName, data, dryRun) {
  const db = destDb();
  const entries = Object.entries(data);
  const docCount = entries.length;

  if (docCount === 0) {
    console.log(`    [write]  ${collectionName}: nothing to write`);
    return;
  }

  if (dryRun) {
    console.log(`    [dry-run] ${collectionName}: would write ${docCount} docs`);
    return;
  }

  const batchSize = 500;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = db.batch();
    const slice = entries.slice(i, i + batchSize);
    slice.forEach(([docId, docData]) => {
      batch.set(db.collection(collectionName).doc(docId), docData);
    });
    await batch.commit();
    console.log(
      `    [write]  ${collectionName}: batch ${Math.floor(i / batchSize) + 1} — ${slice.length} docs`
    );
  }
  console.log(`    [write]  ${collectionName}: done (${docCount} total)`);
}

async function validateCollection(collectionName, expected) {
  const db = destDb();
  const snapshot = await db.collection(collectionName).get();
  const got = snapshot.size;
  const want = Object.keys(expected).length;

  if (got === want) {
    console.log(`    [valid]  ${collectionName}: OK (${got} docs)`);
    return true;
  } else {
    console.error(`    [valid]  ${collectionName}: MISMATCH — expected ${want}, found ${got}`);
    return false;
  }
}

// ─── Main migration ───────────────────────────────────────────────────────────

async function migrate(options) {
  const {
    sourceEnv,
    destEnv,
    collections,
    dryRun,
    skipBackup,
    teamLimit,
  } = options;

  console.log('\n=== Billfish Pachanga — Firestore Migration ===');
  console.log(`  Mode           : ${dryRun ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log(`  Source         : OLD ${sourceEnv}`);
  console.log(`  Destination    : NEW ${destEnv}`);
  console.log(`  Collections    : ${collections.join(', ')}`);
  if (teamLimit) console.log(`  Team limit     : ${teamLimit}`);

  // ── Backup destination ────────────────────────────────────────────────────
  if (!skipBackup && !dryRun) {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    console.log('\n--- Backing up destination ---');
    for (const col of collections) {
      await backupCollection(col, backupDir);
    }
  }

  // ── Read → Write each collection ─────────────────────────────────────────
  const allData = {};
  let teamIds2024 = [];
  let teamIds2025 = [];

  console.log('\n--- Reading source data ---');

  for (const col of collections) {
    if (col === 'teams2024' || col === 'teams2025') {
      allData[col] = await readCollection(col, teamLimit);
    } else if (col === 'catches2024' || col === 'pots2024') {
      // If we already read teams2024, filter by those teamIds
      // Otherwise read the full collection
      allData[col] = await readCollection(col, null);
    } else {
      allData[col] = await readCollection(col, null);
    }
  }

  // If teamLimit was applied to teams, filter related collections accordingly
  if (teamLimit) {
    if (allData['teams2024']) {
      teamIds2024 = Object.keys(allData['teams2024']);
      if (allData['catches2024']) {
        allData['catches2024'] = Object.fromEntries(
          Object.entries(allData['catches2024']).filter(
            ([, doc]) => teamIds2024.includes(doc.teamId)
          )
        );
        console.log(`    [filter] catches2024 → ${Object.keys(allData['catches2024']).length} docs (team-filtered)`);
      }
      if (allData['pots2024']) {
        allData['pots2024'] = Object.fromEntries(
          Object.entries(allData['pots2024']).filter(
            ([, doc]) => teamIds2024.includes(doc.teamId)
          )
        );
        console.log(`    [filter] pots2024 → ${Object.keys(allData['pots2024']).length} docs (team-filtered)`);
      }
    }
    if (allData['teams2025']) {
      teamIds2025 = Object.keys(allData['teams2025']);
      if (allData['catches2025']) {
        allData['catches2025'] = Object.fromEntries(
          Object.entries(allData['catches2025']).filter(
            ([, doc]) => teamIds2025.includes(doc.teamId)
          )
        );
        console.log(`    [filter] catches2025 → ${Object.keys(allData['catches2025']).length} docs (team-filtered)`);
      }
      if (allData['pots2025']) {
        allData['pots2025'] = Object.fromEntries(
          Object.entries(allData['pots2025']).filter(
            ([, doc]) => teamIds2025.includes(doc.teamId)
          )
        );
        console.log(`    [filter] pots2025 → ${Object.keys(allData['pots2025']).length} docs (team-filtered)`);
      }
    }
  }

  console.log('\n--- Writing to destination ---');
  for (const col of collections) {
    await writeCollection(col, allData[col] || {}, dryRun);
  }

  if (!dryRun) {
    console.log('\n--- Validating ---');
    let allValid = true;
    for (const col of collections) {
      const ok = await validateCollection(col, allData[col] || {});
      if (!ok) allValid = false;
    }

    if (allValid) {
      console.log('\nMigration complete. All collections validated successfully.');
    } else {
      console.log('\nMigration complete with validation errors. Check backups if rollback is needed.');
    }
  } else {
    console.log('\nDry run complete. No data was written.');
  }

  // Summary
  console.log('\n--- Summary ---');
  for (const col of collections) {
    const count = Object.keys(allData[col] || {}).length;
    console.log(`  ${col}: ${count} docs`);
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    sourceEnv: 'prod',
    destEnv: 'staging',
    collections: [...ALL_COLLECTIONS],
    dryRun: false,
    skipBackup: false,
    teamLimit: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
        opts.sourceEnv = args[++i];
        if (!['prod', 'staging'].includes(opts.sourceEnv)) {
          console.error('--source must be "prod" or "staging"');
          process.exit(1);
        }
        break;
      case '--dest':
        opts.destEnv = args[++i];
        if (!['staging', 'production'].includes(opts.destEnv)) {
          console.error('--dest must be "staging" or "production"');
          process.exit(1);
        }
        break;
      case '--collections':
        opts.collections = args[++i].split(',').map((s) => s.trim());
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--skip-backup':
        opts.skipBackup = true;
        break;
      case '--team-limit':
        opts.teamLimit = parseInt(args[++i], 10);
        break;
      case '--help':
        console.log(`
Usage: node scripts/migrate-to-new-projects.js [options]

Options:
  --source <prod|staging>          Which OLD project to read from (default: prod)
  --dest   <staging|production>    Which NEW project to write to  (default: staging)
  --collections <c1,c2,...>        Comma-separated collection names
                                   Default: ${ALL_COLLECTIONS.join(',')}
  --dry-run                        Read source, print counts, no writes
  --skip-backup                    Skip backing up destination first
  --team-limit <n>                 Limit teams for a quick smoke-test
  --help                           Show this help

Key files required (place in scripts/keys/):
  old-prod.json     — service account for billfish-pachanga-2024-prod
  old-staging.json  — service account for billfish-pachanga-2024-staging

Examples:
  # Full migration old prod → new staging
  node scripts/migrate-to-new-projects.js --source prod --dest staging

  # Quick smoke-test (5 teams only, no writes)
  node scripts/migrate-to-new-projects.js --source prod --dest staging --team-limit 5 --dry-run

  # Only 2025 data → new staging
  node scripts/migrate-to-new-projects.js --collections teams2025,catches2025,pots2025

  # Push to new production once staging looks good
  node scripts/migrate-to-new-projects.js --source prod --dest production
`);
        process.exit(0);
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();

  console.log('\nInitializing Firebase apps...');
  initSource(opts.sourceEnv);
  initDest(opts.destEnv);

  try {
    await migrate(opts);
    process.exit(0);
  } catch (err) {
    console.error('\nFatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
