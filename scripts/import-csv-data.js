/**
 * import-csv-data.js
 *
 * Imports historical tournament CSV data into the NEW Firestore project.
 *
 * Place the three CSV files in:
 *   scripts/data/{YEAR}/teams.csv
 *   scripts/data/{YEAR}/catches.csv
 *   scripts/data/{YEAR}/pots.csv
 *
 * Usage:
 *   node scripts/import-csv-data.js [options]
 *
 * Options:
 *   --year <2025|2024|2023>       Year to import (default: 2025)
 *   --dest <staging|production>   Target Firestore project (default: staging)
 *   --collection <teams|catches|pots|all>   Which collections to import (default: all)
 *   --dry-run                     Print what would be written without writing
 *
 * Known limitation:
 *   The pots CSV only contains board-level fee totals (Captain & Mate, Billfish,
 *   Meatfish). It does NOT contain individual pot selections (e.g. which specific
 *   "Blue Marlin ($1,000)" pots each team entered). As a result, the "By Pot"
 *   payout view will not show historical entries from this import. The "By Team"
 *   summary will work correctly (total payout per team).
 *
 *   To restore full "By Pot" accuracy, use the admin dashboard to re-enter
 *   individual pot selections for each team, or provide a more detailed CSV.
 *
 * Dependencies (already in api/node_modules — no install needed):
 *   csv-parse, dayjs, firebase-admin, dotenv
 */

'use strict';

const path   = require('path');
const fs     = require('fs');

// All deps live in api/node_modules — no separate install needed
const dotenv       = require(path.join(__dirname, '../api/node_modules/dotenv'));
const { parse }    = require(path.join(__dirname, '../api/node_modules/csv-parse/dist/cjs/sync.cjs'));
const dayjs        = require(path.join(__dirname, '../api/node_modules/dayjs'));
const customFormat = require(path.join(__dirname, '../api/node_modules/dayjs/plugin/customParseFormat'));
const admin        = require(path.join(__dirname, '../api/node_modules/firebase-admin'));

dayjs.extend(customFormat);
dotenv.config({ path: path.join(__dirname, '../.env') });

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const has  = (name) => args.includes(name);

const YEAR       = flag('--year') || '2025';
const DEST       = flag('--dest') || 'staging';
const COLLECTION = flag('--collection') || 'all';
const DRY_RUN    = has('--dry-run');
const isProd     = DEST === 'production';

// ── Firebase init ─────────────────────────────────────────────────────────────
const pick = (prodKey, stagKey) => isProd
  ? process.env[prodKey]
  : process.env[stagKey];

admin.initializeApp({
  credential: admin.credential.cert({
    type:                        pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_PRODUCTION',                      'REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_STAGING'),
    project_id:                  pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_PRODUCTION',                'REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_STAGING'),
    private_key_id:              pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_PRODUCTION',            'REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_STAGING'),
    private_key:                 pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_PRODUCTION',               'REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_STAGING').replace(/\\n/g, '\n'),
    client_email:                pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_PRODUCTION',              'REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_STAGING'),
    client_id:                   pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_PRODUCTION',                 'REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_STAGING'),
    auth_uri:                    pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_PRODUCTION',                  'REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_STAGING'),
    token_uri:                   pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_PRODUCTION',                 'REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_STAGING'),
    auth_provider_x509_cert_url: pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_PRODUCTION', 'REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_STAGING'),
    client_x509_cert_url:        pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_PRODUCTION',     'REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_STAGING'),
    universe_domain:             pick('REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_PRODUCTION',          'REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_STAGING'),
  }),
});
const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────────────────────────
function readCsv(filename) {
  const filepath = path.join(__dirname, 'data', YEAR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`CSV not found: ${filepath}\nPlace the file there and re-run.`);
  }
  const raw = fs.readFileSync(filepath, 'utf8');
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

/**
 * Attempt to fix mojibake caused by UTF-8 bytes being misread as latin-1.
 * e.g. "SeÃ±ora" → "Señora"
 */
function fixEncoding(str) {
  if (!str) return str;
  try {
    return Buffer.from(str, 'latin1').toString('utf8');
  } catch (_) {
    return str;
  }
}

/**
 * Parse "05:29 PM, Jul 17th 2025" → ISO 8601 string.
 * Strips ordinal suffixes (st/nd/rd/th) before parsing.
 */
function parseDateTime(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/g, '$1');
  const parsed  = dayjs(cleaned, 'hh:mm A, MMM D YYYY');
  return parsed.isValid() ? parsed.toISOString() : raw;
}

function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, '')) || 0;
}

async function addDoc(collectionName, data) {
  if (DRY_RUN) {
    const preview = JSON.stringify(data).slice(0, 160);
    console.log(`    [DRY RUN] → ${collectionName}: ${preview}…`);
    return `dry-${Math.random().toString(36).slice(2, 8)}`;
  }
  const colRef = db.collection(collectionName);
  const ref    = await colRef.add(data);
  // Store doc's own ID back into the document (matches live registration pattern)
  const idField = collectionName.replace(/\d+$/, '') + 'Id'; // e.g. "teamsId" → but we want "teamId"
  const cleanIdField = idField.replace(/s(\d*)Id$/, '$1Id') || idField; // "teams2025" → "teamId"
  await ref.update({ [cleanIdField]: ref.id });
  return ref.id;
}

// ── Import: Teams ─────────────────────────────────────────────────────────────
async function importTeams() {
  console.log(`\n── Teams → teams${YEAR} ${'─'.repeat(40)}`);
  const rows      = readCsv('teams.csv');
  const teamIdMap = {}; // teamName (fixed) → Firestore docId

  for (const row of rows) {
    const teamName   = fixEncoding(row['Team'] || '');
    const totalFee   = parseCurrency(row['Total Fee ($)']);
    const checkedIn  = (row['Checked-In?'] || '').toLowerCase() === 'yes';
    const regTime    = parseDateTime(row['Time of Registration']);
    const boatPhoto  = row['Boat Photo'] || '';
    const extraWristbands = parseInt(row['# Extra Wristbands'] || '0', 10);

    const doc = {
      teamName,
      teamEmail:                      row['Email'] || '',
      teamPhone:                      row['Phone'] || '',
      totalFeePaidAtCheckout:         totalFee,
      hasCheckedIn:                   checkedIn,
      registrationTimestampInLocalTime: regTime,
      boatPhoto,
      extraWristbands,           // 2025 add-on: extra wristbands at $200 each
      importedFromCsv:           true,
      importYear:                YEAR,
    };

    console.log(`  ${teamName}`);
    const docId = await addDoc(`teams${YEAR}`, doc);
    teamIdMap[teamName] = docId;
  }

  console.log(`  ✓ ${rows.length} teams`);
  return teamIdMap;
}

// ── Import: Catches ───────────────────────────────────────────────────────────
async function importCatches(teamIdMap) {
  console.log(`\n── Catches → catches${YEAR} ${'─'.repeat(38)}`);
  const rows = readCsv('catches.csv');
  let count  = 0;

  // Track unmatched teams so we only warn once per team
  const unmatchedTeams = new Set();

  for (const row of rows) {
    const teamName = fixEncoding(row['Team'] || '');
    const teamId   = teamIdMap[teamName] || '';

    if (!teamId && !unmatchedTeams.has(teamName)) {
      console.warn(`  ⚠  No team doc found for catch team: "${teamName}" — teamId will be empty`);
      unmatchedTeams.add(teamName);
    }

    const doc = {
      teamName,
      teamId,
      species:     row['Species']     || '',
      speciesType: row['Type']        || '',
      weight:      parseFloat(row['Weight (lbs)']) || 0,
      length:      parseFloat(row['Length (in)'])  || 0,
      girth:       parseFloat(row['Girth (in)'])   || 0,
      points:      parseInt(row['Points'], 10)      || 0,
      dateTime:    parseDateTime(row['Time of Catch']),
      importedFromCsv: true,
    };

    console.log(`  ${doc.species.padEnd(20)} ${teamName}`);
    await addDoc(`catches${YEAR}`, doc);
    count++;
  }

  console.log(`  ✓ ${count} catches`);
}

// ── Import: Pots ──────────────────────────────────────────────────────────────
async function importPots(teamIdMap) {
  console.log(`\n── Pots → pots${YEAR} ${'─'.repeat(44)}`);
  console.log(`  ⚠  boardSelections[] will be EMPTY — "By Pot" views won't reflect`);
  console.log(`     historical 2025 entries. "By Team" totals will be correct.`);
  const rows = readCsv('pots.csv');
  let count  = 0;

  for (const row of rows) {
    const teamName       = fixEncoding(row['Team'] || '');
    const teamId         = teamIdMap[teamName] || '';
    const captainMateFee = parseCurrency(row['Captain & Mate Board Fee']);
    const billfishFee    = parseCurrency(row['Billfish Fee']);
    const meatfishFee    = parseCurrency(row['Meatfish Fee']);
    const totalPotFee    = parseCurrency(row['Total Fee']);

    const doc = {
      teamName,
      teamId,
      potYear:                    `pots${YEAR}`,
      totalPotFee,
      totalCaptainAndMateBoardFee: captainMateFee,
      totalBillfishBoardFee:       billfishFee,
      totalMeatfishBoardFee:       meatfishFee,
      // boardSelections drives the "By Pot" payout calculations.
      // The CSV only has board totals, not individual pot names per team.
      // Use the admin dashboard to fill these in for accurate "By Pot" results.
      boardSelections: [],
      importedFromCsv: true,
      importNote: 'Imported from CSV. boardSelections empty — By Pot calculations inaccurate.',
    };

    console.log(`  ${teamName.padEnd(30)} total $${totalPotFee.toLocaleString()}`);
    await addDoc(`pots${YEAR}`, doc);
    count++;
  }

  console.log(`  ✓ ${count} pot records`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('═'.repeat(60));
  console.log(`  CSV Import  |  year: ${YEAR}  |  dest: ${DEST}  |  ${DRY_RUN ? 'DRY RUN' : 'LIVE WRITE'}`);
  console.log(`  collections: ${COLLECTION}`);
  console.log('═'.repeat(60));

  try {
    let teamIdMap = {};

    if (['all', 'teams'].includes(COLLECTION)) {
      teamIdMap = await importTeams();
    }

    // If only importing catches/pots (not teams), try to build the teamIdMap
    // from whatever already exists in Firestore so teamId references are correct.
    if (COLLECTION !== 'all' && COLLECTION !== 'teams') {
      console.log(`\n  Loading existing teams${YEAR} from Firestore to resolve teamIds…`);
      if (!DRY_RUN) {
        const snap = await db.collection(`teams${YEAR}`).get();
        snap.forEach(doc => {
          const d = doc.data();
          if (d.teamName) teamIdMap[d.teamName] = doc.id;
        });
        console.log(`  Loaded ${Object.keys(teamIdMap).length} teams`);
      }
    }

    if (['all', 'catches'].includes(COLLECTION)) {
      await importCatches(teamIdMap);
    }

    if (['all', 'pots'].includes(COLLECTION)) {
      await importPots(teamIdMap);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('  ✅  Import complete');
    console.log('═'.repeat(60));
  } catch (err) {
    console.error('\n❌  Import failed:', err.message);
    process.exit(1);
  }

  process.exit(0);
})();
