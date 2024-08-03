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
# CHANGELOG
# v3.0.0
# Initial commit of the project. 
###############################################################################
###############################################################################
# DEV HOURS: 6
# AS OF: 3 August 2024
###############################################################################
###############################################################################
# NEW TOURNAMENT SETUP STEPS
1. Fork new github repo for tournament from template
2. Get artwork from client
  - Homepage logo (size = FIXME)
  - Navbar logo (size = FIXME)
  - Favicon (size = FIXME)
3. Update the client/public folder
  - Add client title to index.html 
  - Add client favicon.ico to folder
4. Update the .env file in the main project directory
  - Add client stripe
  - Add client firebase
  - Add google Cloud
5. Update the config.js file at client/src/config.js
###############################################################################
###############################################################################
# FUTURE FEATURE ADDITIONS
- Sponsors (links to their site)
- Media (photos, videos of past tournaments)
- Merch shop (standalone, with registration)
- Newsfeed
- Stats (public/private)
- Participants (angler/boat profiles)
- Email list (customer follow up, advertising, etc.)
###############################################################################
###############################################################################
#DEV TODO
[x] Create repo, frame
[x] Footer
[x] Home page
[] Registration page
[] Admin page
[] Catches page
[] Leaderboard page
[] Pots page
[] Auction page
[] Styling
[] Create dev branch, heroku deploy
[] Full scale QA with BFP2024 data
[] Create as subdomain of customtournamentsolutions/[NAME_GOES_HERE]

REGISTRATION
[] vars: additionalRegistrationFields, includeImageFile, hasSponsorRegistration
[] Big tournaments have a place to uplaod an image file for their boat/ reports
[] Use universal cutoff timestamp
[] Include checkedIn box
[] Include userInput unique text fields (e.g. hometown)
[] Autocomplete using past entry data
[] Bulk upload feature for teams

ADMIN
[] vars: numLeaderboardAwards (e.g. top 3?)
[] Stay on same tab on refresh
[] Team tab
[] Catches tab
[] Pots tab
[] Auction tab
[] Reports tab (registration check-in, leaderboard summary, pot summary, auction summary, full award summary that includes)
[] Stats tab
[] Settings tab (hideLeaderboard, hidePots, hideAuction, hide? all pages by toggling the hasWhatever variable)
[] Full catch report (timestamp vs l/w/g)

CATCHES
[] vars: listOfFieldsToDisplay (e.g. name, age, gender, team, length, width, girth)
[] Searchable by team / angler
[] Bulk upload feature for catches

LEADERBOARD
[] vars: numLeaderboardRows, hasSpeciesWinners, hasGrandChampion, hasGrandSlam, hasCatchAndReleaseDaily, hasMeatfishDaily, finalResultsTimestamp
[] Add title mapping (e.g. ?Grand Champion? endpoint can use a different name)
[] Add point mapping for all fish types? e.g. 1lb = 1pt, blue marlin = 100pts
[] Toggle ?preliminary? vs ?final? message using config file time stamp
[] Views: list, select, slideshow
[] If no winners yet, post empty table

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

AUCTION
[] vars: auctionStartTimestamp, auctionEndTiimestamp, hideAuctionEmails, hideAuctionPhoneNumbers, *checkboxStrings: e.g. is 21?*
[] See DSR notes?
[] Add stat to the homepage

STYLING
[] Loading screens for all
[] Move the header and background colors to the config file
[] Sorting arrows visible on tables
[] "FIXME" search and replace
[] BasePage.css (multiple)
[] HomePage.css (multiple)
[] RegisterPage.css (multiple)
[] RootNavigation.css (multiple)

