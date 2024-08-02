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
DEV HOURS: 0
AS OF: XX August 2024
###############################################################################
###############################################################################
SETUP STEPS
1. Create a new github repo for the event
2. FIXME: Stripe
  - Add client credentials to the .env file in the main directory
  - Add client credentials to the .env file in the client directory
3. FIXME: Firebase
  - Add client credentials to the .env file in the main directory
  - Add client credentials to the .env file in the client directory
4. FIXME: Google Cloud
  - Add client credentials to the .env file in the main directory
  - Add client credentials to the .env file in the client directory
5. FIXME: Heroku
  - Add the following config variables to the dev project
  - Add the following config variables to the prod project
6. FIXME: .env
  - In the main directory, replace the DWD Stripe credentials with the client's
  - Repeat this in the client directory
7. FIXME: Config fields
  - appConfig
  - contactConfig
  - firebaseConfig
  - stripeConfig
###############################################################################
###############################################################################
GENERAL
[x] Create repo
[x] Frame out main directory
[] Frame out api (move stuff to config)
[] Frame out client (move stuff to config)

CONFIG: 
[] vars: hasRegistration, hasLeaderboard, hasPots, hasAuction, hasCatches => dictates admin tabs and links in nav bar, hasCatchAndRelease, hasMeatfish, catchAndReleaseSpeciesList, meatfishSpeciesList
[] Write so that ?team? can be boat or angler?
[] Sorting arrows visible on all tables
[] Loading screens for all
[] Put as a subdomain on our site
[] Bulk upload feature from a local csv file
[] move contact info to its own config file for footer

HOME
[] vars: hasEarlyBirdRegistration, earlyBirdCutoffTimestamp, earlyBirdPrice, regularPrice, tournamentStartDate, tournamentEndDate, rulesUrl, tournamentWebsiteUrl, tournamentLogoUrl

REGISTRATION
[] vars: additionalRegistrationFields, includeImageFile, hasSponsorRegistration
[] Big tournaments have a place to uplaod an image file for their boat/ reports
[] Use universal cutoff timestamp
[] Include checkedIn box
[] Include userInput unique text fields (e.g. hometown)
[] Autocomplete using past entry data

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

AUCTION
[] vars: auctionStartTimestamp, auctionEndTiimestamp, hideAuctionEmails, hideAuctionPhoneNumbers, *checkboxStrings: e.g. is 21?*
[] See DSR notes?

NEW FEATURES
- Sponsors (links to their site)
- Media (photos, videos of past tournaments)
- Merch shop (standalone, with registration)
- Newsfeed
- Stats (public/private)
- Participants (angler/boat profiles)
- Email list (customer follow up, advertising, etc.)
