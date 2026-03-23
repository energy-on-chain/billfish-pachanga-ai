# Billfish Pachanga — Tournament App (AI Edition)

Multi-year fishing tournament web application. React/Vite frontend, Node/Express backend, Firebase Firestore, Redis caching, Stripe payments, Heroku hosting.

- **GitHub:** `energy-on-chain/billfish-pachanga-ai`
- **Staging Firebase:** `white-feat-490620-j0`
- **Production Firebase:** `billfish-pachanga-ai-prod`
- **Staging Heroku:** *(connect to `develop` branch — see Heroku setup below)*
- **Production Heroku:** `billfish-pachanga-production-ae9f4209fe66.herokuapp.com`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, MUI, React Router |
| Backend | Node.js 18+, Express, Morgan, Redis cache |
| Database | Firebase Firestore (via firebase-admin) |
| Auth | Firebase Auth |
| Payments | Stripe |
| Sessions | express-session + Redis (connect-redis) |
| Hosting | Heroku (pipeline: staging + production) |
| Node version | `18.20.8` minimum (required for firebase-admin) |

---

## Repository Structure

```
/
├── api/                        # Express backend
│   ├── controllers/            # Route handler logic
│   ├── middleware/
│   │   └── errorHandler.js     # asyncHandler + centralized error handler
│   ├── routes/                 # Express routers
│   ├── services/
│   │   └── cache.js            # Redis cache service (60s TTL)
│   └── server.js
├── client/                     # React/Vite frontend
│   ├── src/
│   │   ├── config/             # Per-year tournament config
│   │   │   ├── masterConfig.js # Dynamic config loader (pick by year)
│   │   │   ├── config2023/
│   │   │   ├── config2024/
│   │   │   ├── config2025/
│   │   │   └── config2026/     # Active tournament configs
│   │   ├── components/
│   │   ├── pages/
│   │   └── images/
│   ├── .env                    # Client VITE_ env vars (gitignored)
│   └── vite.config.js
├── scripts/
│   ├── data/                   # CSV source data per year (gitignored keys/)
│   │   └── 2025/               # teams.csv, catches.csv, pots.csv
│   ├── import-csv-data.js      # Import CSV data into Firestore
│   └── migrate-to-new-projects.js  # Migrate Firestore data between Firebase projects
├── .env                        # Root REACT_APP_ env vars for API server (gitignored)
├── package.json                # Root: heroku-postbuild, start scripts
└── Procfile                    # (not required — root package.json start handles it)
```

---

## Local Development Setup

### Prerequisites

```bash
nvm use 18          # Node 18+ required
redis-server        # Redis must be running locally
```

### Install & Run

```bash
# Terminal 1 — API server
cd api && npm install && npm run dev

# Terminal 2 — React client (Vite dev server)
cd client && npm install && npm run dev

# Terminal 3 — Redis
redis-server

# Terminal 4 — Stripe webhook (for local payment testing)
stripe listen --forward-to localhost:3001/api/registration_webhook
```

### Environment Files

**`/.env`** (API server — `REACT_APP_` prefix):
- Firebase Admin SDK service account credentials (`_STAGING` / `_PRODUCTION`)
- Stripe keys, session secrets, URLs
- `REACT_APP_NODE_ENV=staging` for local dev

**`/client/.env`** (Vite client — `VITE_` prefix):
- Firebase Web SDK config (`_STAGING` / `_PRODUCTION`)
- API server URLs
- `VITE_NODE_ENV=staging` for local dev

---

## Per-Year Config Files

Each year has its own config directory at `client/src/config/configYYYY/`:

| File | Purpose |
|------|---------|
| `adminConfig.js` | Admin user emails |
| `catchConfig.js` | Species, catch types, scoring rules |
| `generalConfig.js` | Table names, feature flags (registration, pots, newsfeed) |
| `homeConfig.js` | Tournament dates, past result strings, countdown target |
| `leaderboardConfig.js` | Leaderboard columns, sort rules |
| `newsfeedConfig.js` | Newsfeed display settings |
| `potsConfig.js` | Board definitions, pot split rules |
| `registrationConfig.js` | Entry fees, earlybird dates, cutoff, add-ons, disclaimers |
| `stylingConfig.js` | Brand colors for banner, buttons, text |

`masterConfig.js` dynamically loads the correct config set based on the `year` URL param.

### Registration Safety Flag

`registrationConfig.js` has a `CONFIG_REGISTRATION_PRICES_PENDING_CONFIRMATION` boolean:
- `true` → register page and home page show an amber warning banner, button shows "Coming Soon" and is disabled
- `false` → normal registration flow

**Flip this to `false` once prices and earlybird dates are officially confirmed.**

---

## Data Scripts

### Import CSV tournament data

```bash
# Dry run (no writes)
~/.nvm/versions/node/v18.20.8/bin/node scripts/import-csv-data.js --year=2025 --dry-run

# Live import
~/.nvm/versions/node/v18.20.8/bin/node scripts/import-csv-data.js --year=2025
```

CSV files go in `scripts/data/YYYY/` — `teams.csv`, `catches.csv`, `pots.csv`.

### Migrate Firestore data between Firebase projects

```bash
# Dry run
~/.nvm/versions/node/v18.20.8/bin/node scripts/migrate-to-new-projects.js --dry-run

# Live (writes to both staging and production new projects)
~/.nvm/versions/node/v18.20.8/bin/node scripts/migrate-to-new-projects.js
```

Service account JSON keys go in `scripts/keys/` (gitignored).

---

## Git Branching

| Branch | Purpose | Heroku deploy target |
|--------|---------|---------------------|
| `develop` | Integration / staging | Staging app (auto-deploy) |
| `main` | Production | Production app (auto-deploy) |

### Typical workflow

```bash
# Work on develop, commit, push
git checkout develop
# ... make changes ...
git add <files>
git commit -m "your message"
git push origin develop     # → triggers staging auto-deploy

# After staging verified, promote to production
git checkout main
git merge develop
git push origin main        # → triggers production auto-deploy
```

---

## Heroku Setup

### First-time: Connect the new GitHub repo

The Heroku pipeline must be connected to `energy-on-chain/billfish-pachanga-ai` (the new AI repo). If it is currently pointing to the old repo (`billfish-pachanga-v3`), update it:

1. Go to your Heroku pipeline dashboard
2. Click the **"..."** menu on the staging app → **Configure automatic deploys**
3. Disconnect the old repo, connect `energy-on-chain/billfish-pachanga-ai`
4. Set branch to `develop` → enable automatic deploys
5. Repeat for the production app, branch `main`

### Config Vars

Both apps need the full set of `VITE_*` and `REACT_APP_*` env vars. See the project `.env` and `client/.env` for all variable names. Key differences between apps:

| Variable | Staging value | Production value |
|----------|--------------|-----------------|
| `REACT_APP_NODE_ENV` | `staging` | `production` |
| `VITE_NODE_ENV` | `staging` | `production` |

**Private key format:** paste as a single line with literal `\n` (backslash-n) characters. The server calls `.replace(/\\n/g, '\n')` at runtime.

**Redis:** The `REDIS_TLS_URL` var is set automatically by the Heroku Key-Value Store addon — do not add it manually.

### Heroku Resources

| Resource | Plan | Notes |
|----------|------|-------|
| Web dyno | Eco (or Basic for production) | Eco dynos sleep after 30min inactivity |
| Heroku Key-Value Store (Redis) | Mini ($3/mo) | Upgrade if cache hit rate matters under load |

---

## New Tournament Year Checklist

### 1. Firebase

- [ ] Create `project-name-staging` Firebase project
- [ ] Enable Authentication (Email/Password), Firestore, Storage
- [ ] Set Storage rules (allow read: true, allow write: if request.auth != null)
- [ ] Download service account JSON key, add credentials to `.env`
- [ ] Repeat for `project-name-production`
- [ ] Enable billing on Google Cloud for the Storage bucket

### 2. Codebase

- [ ] Duplicate the most recent `client/src/config/configYYYY/` folder for the new year
- [ ] Update all config files for the new year (dates, fees, table names, colors)
- [ ] Set `CONFIG_REGISTRATION_PRICES_PENDING_CONFIRMATION: true` until prices confirmed
- [ ] Update `CONFIG_HOME_PAST_TOURNAMENT_RESULT_STRINGS` in homeConfig.js with prior year stats
- [ ] Update artwork: logos (desktop/tablet/mobile), navbar logo, favicon
- [ ] Update `client/index.html` title

### 3. Heroku

- [ ] Add Redis addon (Key-Value Store Mini) to staging and production apps
- [ ] Update all config vars to point to new Firebase projects
- [ ] Set up Stripe webhooks for staging and production; update webhook secret keys in config vars
- [ ] Optionally configure custom subdomain (update `allowedOrigins` in `server.js`)

### 4. Stripe

- [ ] Add client logo to payment receipt template
- [ ] Save testing and production private keys + webhook secrets to `.env` / Heroku config vars

### 5. Test

- [ ] Local: homepage, registration (Stripe webhook), leaderboard, pots, newsfeed, admin
- [ ] Staging: full regression
- [ ] Production: smoke test after deploy

---

## Backend Architecture Notes

### Redis Cache Service (`api/services/cache.js`)

Wraps Redis with a simple `get / set / middleware` interface. The `middleware(ttl)` function intercepts `res.json()` — on a MISS it caches the response; on a HIT it returns early with an `X-Cache: HIT` header. Applied to all leaderboard, pots, home, and newsfeed routes with a 60-second TTL.

### Error Handler (`api/middleware/errorHandler.js`)

- `asyncHandler(fn)` — wraps async route handlers so thrown errors reach Express's error middleware
- `errorHandler` — 4-argument Express error middleware, logs errors, returns JSON with stack trace in non-production

### Environment Routing

`server.js` branches on `REACT_APP_NODE_ENV` (`"staging"` vs `"production"`) to initialize the correct Firebase Admin credentials, Stripe keys, and session secrets.

---

## Changelog

### 2026-03 — AI Edition Launch
- Migrated from CRA to Vite (`envPrefix: 'VITE_'`)
- Full frontend visual redesign (new color palette, typography, responsive mobile layout)
- Mobile hamburger nav with close support
- Mobile card views for leaderboard and pots tables
- Added Morgan HTTP logging, centralized error handler, Redis response cache (60s TTL)
- Registration page: prices-pending confirmation banner + "Coming Soon" button state
- Home page: same prices-pending banner; added 2025 past tournament stats
- Migrated all historical Firestore data (2023–2025) to new Firebase projects
- Added CSV import script and 2025 tournament data (31 teams, 197 billfish, $902K pot)
- Git branch renamed `dev` → `develop` to match Heroku pipeline convention
- Moved to new GitHub repo: `energy-on-chain/billfish-pachanga-ai`

### v1.0.0 — 2024-09-19
- Initial project setup from fishing tournament template v3
