/////////////////////////////////////////////////////////////////////////////
// GENERAL SETTINGS /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
module.exports = {

  // VISUAL
  CONFIG_GENERAL_TOURNAMENT_NAME: "Billfish Pachanga",
  CONFIG_GENERAL_YEAR: "2025",
  CONFIG_GENERAL_HAS_INFO: true,
  CONFIG_GENERAL_HAS_REGISTRATION: true,
  CONFIG_GENERAL_HAS_LEADERBOARD: true,
  CONFIG_GENERAL_HAS_NEWSFEED: true,
  CONFIG_GENERAL_HAS_ADMIN: true,
  CONFIG_GENERAL_HAS_STATS_TAB: true,
  CONFIG_GENERAL_HAS_REPORTS_TAB: true,
  CONFIG_GENERAL_HAS_POTS: true,
  CONFIG_GENERAL_HAS_AUCTION: false,
  CONFIG_GENERAL_LINK_TO_TOURNAMENT_WEBSITE:
    "https://www.billfishpachanga.com/",
  CONFIG_GENERAL_LINK_TO_TOURNAMENT_RULES:
    "https://www.billfishpachanga.com/rules/",
  CONFIG_GENERAL_INFO_LINK_OBJECT: {
    "Tournament Site": "https://www.billfishpachanga.com/",
    Rules: "https://www.billfishpachanga.com/rules/",
  },
  CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT: {
    Register: "/register",
    Newsfeed: "/newsfeed",
    Leaderboard: "/leaderboard",
    Pots: "/pots",
    // "Auction": "/auction",
  },
  CONFIG_GENERAL_ADMIN_LINK_OBJECT: {
    Settings: "/admin",
    Dashboard: "/dashboard",
  },
  // CONTACT INFO
  CONFIG_GENERAL_CONTACT_FOOTER_LOCATION_STRING: "Austin, TX    -    New Orleans, LA", // Contact info
  CONFIG_GENERAL_CONTACT_FOOTER_PHONE_STRING: "Phone / Text: (903) 235-5195",
  CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING:
    "Email: info@customtournamentsolutions.com",
  CONFIG_GENERAL_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING:
    " Custom Tournament Solutions, 2023-Present, All Rights Reserved",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_NAME_1: "Cody Craig",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_NAME_2: "Matt Hartigan",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_EMAIL_1: "cody@arrowheadecology.com",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_EMAIL_2: "matthew@deepwaterdigital.tech",

  // FIREBASE
  CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME: "teams2025", // Firebase
  CONFIG_GENERAL_FIREBASE_TEAMS_ID_NAME: "teamId",
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME: "catches2025",
  CONFIG_GENERAL_FIREBASE_CATCHES_ID_NAME: "catchId",
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME: "announcements2025",
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_ID_NAME: "announcementId",
  CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME: "pots2025",
  CONFIG_GENERAL_FIREBASE_POTS_ID_NAME: "potId",
  CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME: "auction2025",
  CONFIG_GENERAL_FIREBASE_AUCTION_ID_NAME: "auctionId",
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME: "announcements2025",
  firebaseStagingConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_STAGING,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_STAGING,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_STAGING,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_STAGING,
    messagingSenderId:
      process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_STAGING,
    appId: process.env.REACT_APP_FIREBASE_APP_ID_STAGING,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_STAGING,
  },
  firebaseProductionConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY_PRODUCTION,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_PRODUCTION,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_PRODUCTION,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_PRODUCTION,
    messagingSenderId:
      process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PRODUCTION,
    appId: process.env.REACT_APP_FIREBASE_APP_ID_PRODUCTION,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_PRODUCTION,
  },
};

