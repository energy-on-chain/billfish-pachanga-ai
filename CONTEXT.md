# Billfish Pachanga AI — Handoff Context

## What This Is
Tournament management app (React 18 SPA + Express.js API + Firebase/Firestore).
Monorepo: `client/` (React) + `api/` (Express). Deployed as single Heroku dyno.

## Current Branch
`claude/trusting-grothendieck` (git worktree of main repo at
`/Users/hartimat/Documents/DWD/Projects/26_08_BillfishPachangaAI`)

The working directory for this worktree is:
`/Users/hartimat/Documents/DWD/Projects/26_08_BillfishPachangaAI/.claude/worktrees/trusting-grothendieck`

## Full Implementation Plan
See: `~/.claude/plans/modular-forging-thacker.md`

## Node Version
Use **Node 18** via nvm: `nvm use 18`
A `.nvmrc` with `18` should be at the project root.

## How to Run Locally (Staging Mode)
```bash
# Terminal 1 — API (Express on :3001)
cd /Users/hartimat/Documents/DWD/Projects/26_08_BillfishPachangaAI/api
npm install   # needed once — 'sharp' was added for HEIC support
npm start

# Terminal 2 — React (CRA dev server on :3000)
cd /Users/hartimat/Documents/DWD/Projects/26_08_BillfishPachangaAI/client
npm start
```

The `.env` file at the project root is fully populated with:
- Firebase web SDK credentials (staging: `white-feat-490620-j0`, prod: `billfish-pachanga-ai-prod`)
- Admin SDK service account keys (both staging and prod)
- Stripe keys (Deepwater Digital account — same as 2025, unchanged)
- Session secrets (same as 2025)
- Server/client URLs

The `client/.env` is also populated with the frontend-only subset of those vars.

## Firebase Projects (NEW for 2026)
| Environment | Firebase Project | GCP Project ID |
|---|---|---|
| Staging | billfish-pachanga-ai-dev | white-feat-490620-j0 |
| Production | billfish-pachanga-ai-prod | billfish-pachanga-ai-prod |

The old 2024/2025 Firebase projects (`billfish-pachanga-2024-staging`, `billfish-pachanga-2024-prod`) still exist but are no longer referenced by the `.env`. Data migration from old → new projects still needs to happen (see below).

## What Has Been Completed — ALL PHASES DONE

### Phase 1 — 2026 Config ✅
- Created `client/src/config/config2026/` with all config files
- Updated `dashboardConfig.js` (2026 as upcoming, 2025 moved to past)
- `client/src/Redirect.js` — already dynamically uses `new Date().getFullYear()`, no change needed

### Phase 2 — Firebase Credentials ✅
- `.env` created at project root with all credentials
- `client/.env` created with frontend-only vars
- New Firebase projects: staging (`white-feat-490620-j0`) + production (`billfish-pachanga-ai-prod`)
- Stripe keys carried over from 2025 (same Deepwater Digital account)

### Phase 3 — Bug Fixes ✅
- Spearfish excluded from "White Marlin or Spearfish" pots → fixed in `potControllers.js` + 2026 `potsConfig.js`
- HEIC/iPhone photo uploads → `sharp` added to `api/package.json`, conversion in `adminControllers.js` + `registrationControllers.js`
- Catch time picker 1-minute intervals → `EditCatchModal.js` + `AddCatchModal.js`
- Catches admin table default sort → `AdminPage.js`
- Catches-by-team report alphabetical → `catchesReports.js`

### Phase 4 — New Features ✅
- 4.1: DateTime autofill when adding catch → `AddCatchModal.js`
- 4.2: Tagged/Satellite Tagged checkboxes → `AddCatchModal.js`, `EditCatchModal.js`, `catchesReports.js`, `adminConfig.js` (2026)
- 4.3: Point totals on catches-by-team report → `catchesReports.js`
- 4.4: Extra Wristbands always on registration PDF → `registrationReports.js`
- 4.5: Pot splits admin UI (Firestore `potConfig{year}`) → `AdminPage.js`, `adminControllers.js`, `adminRoutes.js`, `PotsPage.js`, `potReports.js`
- 4.6: Awards admin UI (Firestore `awardsConfig{year}`) → `AdminPage.js`, `adminControllers.js`, `adminRoutes.js`, `awardReports.js`
- 4.7: Pot payout rollup (no 2nd place → all to 1st) → `potControllers.js`
- 4.8: "No qualifying entrants" message → `potControllers.js`, `PotsPage.js`
- 4.9: Unidentifiable Fish (100/150/300 pts) → `catchConfig.js` (2026)

## What Still Needs Doing

### Data Migration (needed before meaningful testing)
Export 2024/2025 Firestore data from old Firebase projects and import into the new ones.
A db sync script already exists in the repo (see git log: "adding db sync script").
Key collections: `teams2024`, `catches2024`, `teams2025`, `catches2025`, `pots2025`, etc.
This is needed so leaderboards, pots, and reports can be verified with real data.

### Heroku Config Vars (before production deploy)
All vars from the root `.env` need to be set in Heroku for both staging and production dynos:
```bash
heroku config:set REACT_APP_NODE_ENV=staging --app <staging-app-name>
heroku config:set REACT_APP_FIREBASE_API_KEY_STAGING=... --app <staging-app-name>
# ... etc for all vars
```

### Phase 5 — Frontend Redesign (optional, deferred)
- CRA → Vite migration
- MUI theme modernization
- Mobile column width fixes

### Phase 6 — Backend Architecture (optional, deferred)
- Service layer extraction
- Redis caching for leaderboard/pots
- Centralized error handling

### Phase 7 — Boat Photos Admin Tool
- Upload/assign boat photos per team in AdminPage.js

### Phase 8 — Stripe Webhook Validation
- End-to-end test in staging environment

## Key Files Changed This Session
- `client/src/config/config2026/` (all files — new)
- `client/src/config/dashboardConfig.js`
- `client/src/components/modals/AddCatchModal.js`
- `client/src/components/modals/EditCatchModal.js`
- `client/src/generators/catchesReports.js`
- `client/src/generators/registrationReports.js`
- `client/src/generators/potReports.js`
- `client/src/generators/awardReports.js`
- `client/src/pages/AdminPage.js`
- `client/src/pages/PotsPage.js`
- `api/controllers/potControllers.js`
- `api/controllers/adminControllers.js`
- `api/controllers/registrationControllers.js`
- `api/routes/adminRoutes.js`
- `api/package.json` (added sharp)
- `.env` (project root — new, not committed)
- `client/.env` (new, not committed)
