###############################################################################
# PROJECT: Toledo Bend
# DATE STARTED: 16-September-2024
# DESCRIPTION: This is codebase for all Toledo Bend angler tournament
# solutions. It usese V3 of the angler tournament template. 
###############################################################################
###############################################################################
###############################################################################
# CHANGELOG
# v1.0.0
# Initial commit of the project. 
###############################################################################
###############################################################################
###############################################################################
# DEV HOURS: 
# AS OF: DD MM YYYY
###############################################################################
###############################################################################
###############################################################################
# NEW TOURNAMENT SETUP

1. Create a codebase for the project 
  [x] Create a local copy of the latest template repo: https://github.com/energy-on-chain/fishing-tournament-app-template-v3
  [x] Push that copy to a new named repo for the project (e.g. "billfish-pachanga", "toledo-bend", etc.)

2. Setup Firebase
  [x] Create new instance for "project-name-staging"
  [x] Add Authentication microservice ("Email/Password" option, do not include "Email link (passwordless sign-in)")
  [x] Add Cloud Firestore microservice (select "Start in produtcion mode" option)
  [x] Add Storage microservice for image handling (storage rules below)

      rules_version = '2';
      // Craft rules based on data in your Firestore database
      // allow write: if firestore.get(
      //    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
      service firebase.storage {
        match /b/{bucket}/o {
          match /{allPaths=**} {
            // Allow anyone to read
            allow read: if true;
            // Allow only authenticated users to write
            allow write: if request.auth != null;
          }
        }
      }

  [x] Click the "Add Firebase to your web app" button on the dashboard, generate your secrets, add them to project .env files
  [] Repeat this setup process for "project-name-prodution"

3. Setup Google Cloud
  [x] Go to your google cloud console and select the staging instance of the project ("project-name-staging") from the dropdown menu in the navbar, then go to that project's dashboard
  [x] Click on the "Cloud Storage" service. You should see two "buckets" listed
  [x] Select the "project-name-staging.appspot.com" bucket, click the "Permissions" button at the top, then click "Add Principal" to add a member called "allUsers" who is a "Storage Object Viewer"
  [x] Refresh the page, then "Enable Billing" using the message that will pop up above the table that lists your buckets
  [x] Go back to your project dashboard. Click "Service Accounts" on the side menu. Click the "firebase-adminsdk-8kwan@project-name-staging.iam.gserviceaccount.com" item in the table. Then click "Keys", "Add Key", and create a new JSON key.
  [x] The file will be downloaded to your computer. Copy and paste it into the main project directory, then copy and paste the secrets into both of your project .env files.
  [] Repeat this setup process for "project-name-production"

4. Setup Stripe
  [] Get email and password from client, create an account
  [] Add client logo to the "payment receipt" template (https://dashboard.stripe.com/settings/branding)
  [] Save project secret info to put into .env file (private key, webhook secret key for testing)
  [] Save project secret info to put into .env file (private key, webhook secret key for production)

5. Update client artwork (use https://imageresizer.com/)
  [x] Homepage logo for desktop (location="client/src/images/HomePageLogoDesktop.png" maxWidth=1020px)
  [x] Homepage logo for tablet (location="client/src/images/HomePageLogoTablet.png" maxWidth=750px)
  [x] Homepage logo for mobile (location="client/src/images/HomePageLogoMobile.png" location= maxWidth=350px)
  [x] Navbar logo for all devices (location="client/src/images/NavBarLogo.png" size=125px wide by 63px tall or smaller)
  [x] Favicon logo for all devices (location="client/public/favicon.ico" size=48px by 48px )
  [x] Add all necessary logos to the src/components/dashboard folder for display on the dashboard page
  [x] Add client title to index.html 

6. Update project config files
  [x] adminConfig.js
  [x] catchConfig.js
  [x] dashboardConfig.js
  [x] generalConfig.js
  [x] homeConfig.js
  [x] leaderboardConfig.js
  [x] newsfeedConfig.js
  [x] potsConfig.js
  [x] registrationConfig.js
  [x] stylingConfig.js

7. Setup Heroku
  [x] Login to your dashboard and create a new project
  [x] Create a develop branch for the repo
  [x] Select "GitHub" as deployment method and connect the "energy-on-chain/project-name" repo
  [x] Enable automatic deployment for the "develop" branch
  [x] Go to the "deploy" tab and "Create new pipeline". Start with the "staging" stage. The name will be "project-name-staging".
    [x] Go to resources tab and enable Heroku Redis (mini, $3/mo) for your project.
    [] Enter all variables from .env file to config_vars tab for staging
    [] Setup Stripe (staging) webhook(s) for registration, pots
  [] Go to the project dashboard and "Add app" to set up "project-name-production" to auto-deploy when the main branch is pushed
    [] Go to resources tab and enable Heroku Redis (mini, $3/mo) for your project.
    [] Setup Stripe (production) webhook(s) for registration, pots
    [] Enter all variables from .env file to config_vars tab for production

8. Test
  [x] Local test (don't forget to start local stripe webhook in terminal!!!)
    [x] Homepage functionality
    [x] Registration functionality (Stripe webhook urls for staging and production environment)
    [x] Dashboard functionality
    [x] Admin functionality (including login and logout)
    [x] Newsfeed functionality
    [x] Leaderboard functionality
    [x] Pots functionality
    [x] Auction funtionality
    [x] Look at Firestore, confirm data being stored correctly
    [x] Look at Firebase Storage, confirm images being stored correctly
    [] FIXME: additional testing...? Redis...?
  [] Staging environment test
  [] Production environment test


###############################################################################
###############################################################################
###############################################################################
# DEV NOTES
- Start react: (run in client and api terminals: nvm use 21.6.0)
- Start redis server: (run in terminal: redis-server, confirm running: redis-cli ping)
- Start stripe webhook for local dev: (run in terminal: stripe listen --forward-to localhost:3001/api/registration-webhook)

