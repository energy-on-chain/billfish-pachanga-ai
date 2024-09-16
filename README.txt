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
  [] Push that copy to a new named repo for the project (e.g. "billfish-pachanga", "toledo-bend", etc.)
  [] Create a master branch and dev branch
2. Update client artwork (use https://imageresizer.com/)
  [] Homepage logo for desktop (location="client/src/images/HomePageLogoDesktop.png" maxWidth=1020px)
  [] Homepage logo for tablet (location="client/src/images/HomePageLogoTablet.png" maxWidth=750px)
  [] Homepage logo for mobile (location="client/src/images/HomePageLogoMobile.png" location= maxWidth=350px)
  [] Navbar logo for all devices (location="client/src/images/NavBarLogo.png" size=125px wide by 63px tall or smaller)
  [] Favicon logo for all devices (location="client/public/favicon.ico" size=48px by 48px )
  [] Add all necessary logos to the src/components/dashboard folder for display on the dashboard page
  [] Add client title to index.html 
3. Setup Stripe
  [] Get email and password from client
  [] Add client logo to the "payment receipt" template
  [] Setup staging webhook(s) for registration, pots
  [] Setup production webhook(s) for registration, pots
  [] Save project secred info to put into .env file (e.g. private key, webhook key)
4. Setup Firebase
  [] Authentication (add admin emails and passwords)
  [] Firestore Database
  [] Storage (for images)
  [] Save project secret info to put into .env file
  [] Set the Storage "Rules" as follows:
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
5. Setup Google Cloud
  [] Go to the google cloud console for the project and enable Cloud Storage
  [] Go to the settings tab for your storage bucked (staging and production), then create a new member called "allUsers" who is a "Storage Object Viewer"
6. Update project config files
  [] Add client stripe info to .env
  [] Add client firebase info to .env
  [] Add google cloud info to .env...?
  [] adminConfig.js
  [] catchConfig.js
  [] dashboardConfig.js
  [] generalConfig.js
  [x] homeConfig.js
  [] leaderboardConfig.js
  [] newsfeedConfig.js
  [] potsConfig.js
  [] registrationConfig.js
  [] stylingConfig.js
7. Setup Heroku
  [] Enable automatic re-deployment via github push for staging and production
  [] Enter all variables from .env file to config_vars tab for staging and production
  [] FIXME: Redis?
8. Test
  [] Stripe webhook urls for staging and production environment
  [] FIXME: additional testing...?
###############################################################################
###############################################################################
###############################################################################
# DEV NOTES
- Start react: (run in client and api terminals: nvm use 21.6.0)
- Start redis server: (run in terminal: redis-server, confirm running: redis-cli ping)
- Start stripe webhook for local dev: (run in terminal: stripe listen --forward-to localhost:3001/api/registration-webhook)

