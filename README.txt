###############################################################################
# PROJECT: Fishing Tournament Template (V3)
# DATE STARTED: 2-August-2024
# DESCRIPTION: This is the third iteration of the "angler tourney application"
# based on customer feedback and lessons learned during the 2024 tournament
# season. This repo is meant to be "copy pasted" and customized / adapted for 
# individual tournaments. The potential functionality includes: catch tracking,
# realtime scoring (leaderboard), fish pots, linked merch sites, online 
# registration and payment, sponsor advertisement, auctions, and more.
###############################################################################
###############################################################################
###############################################################################
# CHANGELOG
# v3.0.0
# Initial commit of the project. 
###############################################################################
###############################################################################
###############################################################################
# DEV HOURS: 12
# AS OF: 9 August 2024
###############################################################################
###############################################################################
###############################################################################
# NEW TOURNAMENT SETUP STEPS
1. Fork new github repo for tournament from template
2. Update client artwork
  - Homepage logo for desktop (location="client/src/images/HomePageLogoDesktop.png" maxWidth=1020px)
  - Homepage logo for tablet (location="client/src/images/HomePageLogoTablet.png" maxWidth=750px)
  - Homepage logo for mobile (location="client/src/images/HomePageLogoMobile.png" location= maxWidth=350px)
  - Navbar logo for all devices (location="client/src/images/NavBarLogo.png" size=125px wide by 63px tall or smaller)
  - Favicon logo for all devices (location="client/public/favicon.ico" size=48px by 48px )
3. Update the client/public folder
  - Add client title to index.html 
4. Setup project Stripe services
  - Get email and password from client
  - Add client logo to the "payment receipt" template
  - Setup staging webhook(s) for registration, pots
  - Setup production webhook(s) for registration, pots
  - Save project secred info to put into .env file (e.g. private key, webhook key)
5. Setup project Firebase services
  - Authentication (add admin emails and passwords)
  - Firestore Database
  - Storage (for images)
  - Set the Storage "Rules" as follows:

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

  - Save project secret info to put into .env file
6. Setup google cloud services
  - Go to the google cloud console for the project and enable Cloud Storage
  - Go to the settings tab for your storage bucked (staging and production), then create a new member called "allUsers" who is a "Storage Object Viewer"
7. Update the .env file in the main project directory
  - Add client stripe info 
  - Add client firebase info
  - FIXME: Add google cloud info...?
8. Update the config.js file at client/src/config.js
  - Update the stripe webhook urls for test and production (test them both!!!)
9. Deploy to heroku
  - Enable automatic re-deployment via github push for staging and production
  - Enter all variables from .env file to config_vars tab for staging and production
  - FIXME: Redis?
###############################################################################
###############################################################################
###############################################################################
# FUTURE FEATURE IDEAS
- Sponsors page (display them, link to sites)
- Sponsor registration
- Media (photos, videos of past tournaments)
- Merch shop (standalone, with registration)
- Newsfeed
- Stats (public/private)
- Participants (angler/boat profiles)
- Email list (customer follow up, advertising, etc.)
###############################################################################
###############################################################################
# DEV NOTES
- Start react: (run in client and api terminals: nvm use 21.6.0)
- Start redis server: (run in terminal: redis-server, confirm running: redis-cli ping)
- Start stripe webhook for local dev: (run in terminal: stripe listen --forward-to localhost:3001/api/registration-webhook)

// TODO
[] Production deployment test using blank template and BFP2024 data (full edge case plan... e.g. ensure correct earlybird switch)
[] Production deployment of BFP2025
[] Production deployment of DSR2025 (don't mess with it too much because it already works!!!!)

ADMIN
[] Fix handling of table properties in CrudTable
[] Implement AdminDeleteModal (teams, catches in config file and server)
[] Implement AdminEditModal (teams, catches in config file and server)
[] Implement AdminAddModal (teams, catches in config file and server)
[] Safe handling of image CRUD (teams, catches, pots, auction)
[] Stats tab
[] Reports tab (registration, catches by team and all, leaderboard by team and all, pots by team and all, auction by person and all, awards by team and all)

CATCHES
[] vars: listOfFieldsToDisplay (e.g. name, age, gender, team, length, width, girth)
[] Searchable (by team, by type, by species, by date)
[] Ability to upload a photo with the catch as well

LEADERBOARD
[] vars: numLeaderboardRows, hasSpeciesWinners, hasGrandChampion, hasGrandSlam, hasCatchAndReleaseDaily, hasMeatfishDaily, finalResultsTimestamp
[] Add title mapping (e.g. ?Grand Champion? endpoint can use a different name)
[] Add point mapping for all fish types? e.g. 1lb = 1pt, blue marlin = 100pts
[] Toggle ?preliminary? vs ?final? message using config file time stamp
[] Views: list, select, slideshow
[] If no winners yet, post empty table
[] Add report to admin reports tab... full awards too
[] modularize all the endpoints... i.e. just swap out the logic

STYLING
[] Loading screens for all
[] Move the header and background colors to the config file
[] Sorting arrows visible on tables
[] "FIXME" search and replace
[] BasePage.css (multiple)
[] HomePage.css (multiple)
[] RegisterPage.css (multiple)
[] RootNavigation.css (multiple)
[] Login.js (avatar style)
[] CrudTable.js (sx styling)
[] AdminPage.js (styling)

POTS
[] vars: numLeaderboardRows, hasSpeciesWinners, hasGrandChampion, hasGrandSlam, hasCatchAndReleaseDaily, hasMeatfishDaily, finalResultsTimestamp
[] Toggle ?preliminary? vs ?final? message using config file time stamp
[] Board views: grid, select
[] Standings views: list, select, slideshow
[] Integrate STRIPE payments? ?hasPaid?? just like check-in field
[] Board creation? hasCatchAndReleaseBoard, hasMeatfishBoard with name mapping
[] If no winner yet, post empty table
[] Deleting a team deletes their pots too
[] Add stat to homepage
[] Add tab to admin
[] Add report to admin

AUCTION
[] vars: auctionStartTimestamp, auctionEndTiimestamp, hideAuctionEmails, hideAuctionPhoneNumbers, *checkboxStrings: e.g. is 21?*
[] See DSR notes?
[] Add stat to the homepage
[] Add tab to admin
[] Add report to admin

ADDITIONAL "NICE TO HAVE" UPGRADES
[] Add chiron to pots or leaderboard
[] Increased ability to handle multiple registration cases (track anglers, captains, mates and incorporate into catches, leaderboard, admin, etc.)
[] Scripts: bulk upload teams (anglers, captains, mates)
[] Scripts: bulk upload catches
[] V4: "Settings" tab on admin where pages can be toggled on and off

