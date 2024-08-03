module.exports = {
  /////////////////////////////////////////////////////////////////////////////
  // 1. General ///////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_GENERAL_YEAR: "2025",
  CONFIG_GENERAL_HAS_REGISTRATION: true,
  CONFIG_GENERAL_HAS_LEADERBOARD: true,
  CONFIG_GENERAL_HAS_CATCHES: true,
  CONFIG_GENERAL_HAS_ADMIN: true,
  CONFIG_GENERAL_HAS_POTS: true,
  CONFIG_GENERAL_HAS_AUCTION: false,

  /////////////////////////////////////////////////////////////////////////////
  // 2. Home //////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_HOME_TOURNAMENT_DATE_STRING: "July 16th - 19th, 2025",
  CONFIG_HOME_TOURNAMENT_START_IN_LOCAL_TIME_IN_MS: "1752642000000",
  CONFIG_HOME_PAST_TOURNAMENT_RESULT_STRINGS: [
    "2023 Tournament: 36 teams / 160 billfish / $654,750 total pot",
    "2024 Tournament: 31 teams / 187 billfish / $854,250 total pot",
  ],
  CONFIG_HOME_SPECIES_TYPE_LIST_FOR_CATCH_COUNT: [
    "Billfish",
    "Meatfish",
  ],

  /////////////////////////////////////////////////////////////////////////////
  // 3. Registration //////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION: true,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS: true,
  CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING: "Pre-registration (before June 15th):",
  CONFIG_REGISTRATION_NORMAL_DATE_STRING: "Normal Registration (after June 15th):",
  CONFIG_REGISTRATION_EARLYBIRD_FEE: 2750,
  CONFIG_REGISTRATION_NORMAL_FEE: 3500,

  /////////////////////////////////////////////////////////////////////////////
  // 4. Firebase //////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_FIREBASE_CATCHES_TABLE_NAME: "catches2025",
  CONFIG_FIREBASE_TEAMS_TABLE_NAME: "teams2025",
  CONFIG_FIREBASE_POTS_TABLE_NAME: "pots2025",
  firebaseStagingConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_STAGING,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_STAGING,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_STAGING,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_STAGING,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_STAGING,
    appId: process.env.REACT_APP_FIREBASE_APP_ID_STAGING,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_STAGING,
  },
  firebaseProductionConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_PRODUCTION,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_PRODUCTION,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_PRODUCTION,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_PRODUCTION,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PRODUCTION,
    appId: process.env.REACT_APP_FIREBASE_APP_ID_PRODUCTION,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_PRODUCTION,
  },

  /////////////////////////////////////////////////////////////////////////////
  // 5. Styling ///////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  // FIXME: pages...
  // FIXME: tables...

  /////////////////////////////////////////////////////////////////////////////
  // 6. Contact ///////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_CONTACT_FOOTER_LOCATION_STRING: "Austin, TX    -    New Orleans, LA",
  CONFIG_CONTACT_FOOTER_PHONE_STRING: "Phone / Text: (903) 235-5195",
  CONFIG_CONTACT_FOOTER_EMAIL_STRING: "Email: info@customtournamentsolutions.com",
  CONFIG_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING: " Custom Tournament Solutions, 2023-Present, All Rights Reserved",
  CONFIG_CONTACT_INFO_ADMIN_NAME_1: "Cody Craig",
  CONFIG_CONTACT_INFO_ADMIN_NAME_2: "Matt Hartigan",
  CONFIG_CONTACT_INFO_ADMIN_EMAIL_1: "cody@arrowheadecology.com",
  CONFIG_CONTACT_INFO_ADMIN_EMAIL_2: "matthew@deepwaterdigital.tech",
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
};

