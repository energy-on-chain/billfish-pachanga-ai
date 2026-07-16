/**
 * import-pots-2026.js
 *
 * Imports 2026 boat-specific pot selections (parsed from the tournament's
 * pot spreadsheet, scripts/data/2026/pots_extracted.json) into the
 * pots2026 Firestore collection, matched against existing teams2026 docs.
 *
 * Usage:
 *   node scripts/import-pots-2026.js [--dest staging|production] [--dry-run]
 *
 * Dependencies (already in api/node_modules):
 *   dotenv, firebase-admin
 */

'use strict';

const path = require('path');
const fs   = require('fs');

const dotenv = require(path.join(__dirname, '../api/node_modules/dotenv'));
const admin  = require(path.join(__dirname, '../api/node_modules/firebase-admin'));

dotenv.config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);

const YEAR    = '2026';
const DEST    = flag('--dest') || 'staging';
const DRY_RUN = has('--dry-run');
const isProd  = DEST === 'production';

// Confirmed fuzzy name matches between the spreadsheet's boat names and the
// registered team names in Firestore (approved by tournament organizer).
const NAME_OVERRIDES = {
  'VAMANOS VIKING': "Vamonos (58' Viking)",
  'SEE-MAH':        'Seemah',
  'BLUE RUSH 2.0':  'Blue Rush',
};

// Registered teams with no pot entry in the spreadsheet - written with zero
// pot buy-ins for now (approved by tournament organizer).
const ZERO_ENTRY_TEAMS = ['Mi Novia', 'Sancha', 'Sigsbee Deep', 'Vol-A-Tile'];

// Satellite Tag pot buy-ins ($2,500 flat fee each) - tracked separately at the
// bottom of the Registration Sheet (rows 48-50), not in the per-boat pot
// columns, so these are layered in by lookup name rather than parsed generically.
const SATELLITE_TAG_ENTRANTS = ['THE EDGE', 'BLUE RUSH 2.0', 'POURED OUT'];

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

function norm(s) {
  return (s || '').trim().toUpperCase().replace(/-/g, ' ').replace(/'/g, '');
}

(async () => {
  console.log('='.repeat(60));
  console.log(`  Pot Import  |  year: ${YEAR}  |  dest: ${DEST}  |  ${DRY_RUN ? 'DRY RUN' : 'LIVE WRITE'}`);
  console.log('='.repeat(60));

  const extractedPath = path.join(__dirname, 'data', YEAR, 'pots_extracted.json');
  if (!fs.existsSync(extractedPath)) {
    throw new Error(`Not found: ${extractedPath}`);
  }
  const boats = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

  // Load existing teams to resolve teamId by name
  console.log(`\nLoading teams${YEAR} from ${DEST}...`);
  const teamsSnap = await db.collection(`teams${YEAR}`).get();
  const teamByNormName = {};
  teamsSnap.forEach(doc => {
    const teamName = doc.data().teamName;
    teamByNormName[norm(teamName)] = { id: doc.id, teamName };
  });
  console.log(`Loaded ${teamsSnap.size} teams`);

  // Check for existing pots docs to avoid creating duplicates
  const potsSnap = await db.collection(`pots${YEAR}`).get();
  const existingPotByTeamId = {};
  potsSnap.forEach(doc => {
    existingPotByTeamId[doc.data().teamId] = doc.id;
  });
  console.log(`Existing pots${YEAR} docs: ${potsSnap.size}`);

  // Build the full list: spreadsheet boats (with name overrides applied) + zero-entry teams
  const entries = boats.map(b => ({
    lookupName: NAME_OVERRIDES[b.boatName] || b.boatName,
    boardData: b.boardData,
  }));
  ZERO_ENTRY_TEAMS.forEach(name => {
    entries.push({ lookupName: name, boardData: {} });
  });

  // Layer in the Satellite Tag pot buy-in for its 3 entrants
  SATELLITE_TAG_ENTRANTS.forEach(boatName => {
    const entry = entries.find(e => norm(e.lookupName) === norm(NAME_OVERRIDES[boatName] || boatName));
    if (!entry) {
      console.warn(`  ⚠  Satellite Tag entrant "${boatName}" not found among parsed boats`);
      return;
    }
    entry.boardData['Satellite Tag'] = [{ title: 'Satellite Tag ($2,500)', amount: 2500 }];
  });

  console.log(`\nProcessing ${entries.length} teams...\n`);

  let written = 0;
  let skippedNoMatch = 0;
  let skippedExisting = 0;

  for (const entry of entries) {
    const match = teamByNormName[norm(entry.lookupName)];
    if (!match) {
      console.warn(`  ⚠  No team match for "${entry.lookupName}" — skipping`);
      skippedNoMatch++;
      continue;
    }

    if (existingPotByTeamId[match.id]) {
      console.warn(`  ⚠  pots${YEAR} doc already exists for "${match.teamName}" — skipping (won't overwrite)`);
      skippedExisting++;
      continue;
    }

    const boardSelections = Object.entries(entry.boardData).map(([board, pots]) => ({
      board,
      potList: pots.map(p => p.title),
      totalFee: pots.reduce((acc, p) => acc + p.amount, 0),
    }));

    const totalPotFee = boardSelections.reduce((acc, s) => acc + s.totalFee, 0);
    const boardFeeFields = boardSelections.reduce((acc, s) => {
      const key = `total${s.board.replace(/ /g, '')}Fee`;
      acc[key] = s.totalFee;
      return acc;
    }, {});

    const potData = {
      teamId: match.id,
      teamName: match.teamName,
      potYear: `pots${YEAR}`,
      boardSelections,
      totalPotFee,
      ...boardFeeFields,
      timestamp: new Date().toISOString(),
      importedFrom: 'Pachanga Tourney 2026 Final.xlsx',
    };

    console.log(`  ${match.teamName.padEnd(25)} total $${totalPotFee.toLocaleString()}  (${boardSelections.length} board(s))`);

    if (!DRY_RUN) {
      const ref = await db.collection(`pots${YEAR}`).add(potData);
      await ref.update({ potId: ref.id });
    }
    written++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  ${DRY_RUN ? 'Would write' : 'Wrote'}: ${written}`);
  console.log(`  Skipped (no team match): ${skippedNoMatch}`);
  console.log(`  Skipped (pot doc already exists): ${skippedExisting}`);
  console.log('='.repeat(60));

  process.exit(0);
})().catch(err => {
  console.error('\nImport failed:', err.message);
  process.exit(1);
});
