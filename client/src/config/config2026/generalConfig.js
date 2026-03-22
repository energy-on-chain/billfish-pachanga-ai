/////////////////////////////////////////////////////////////////////////////
// GENERAL SETTINGS /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
export default {
  // VISUAL
  CONFIG_GENERAL_TOURNAMENT_NAME: "Billfish Pachanga",
  CONFIG_GENERAL_YEAR: "2026",
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
    Register: "/2026/register",
    Newsfeed: "/2026/newsfeed",
    Leaderboard: "/2026/leaderboard",
    Pots: "/2026/pots",
    // "Auction": "/2026/auction",
  },
  CONFIG_GENERAL_ADMIN_LINK_OBJECT: {
    Settings: "/2026/admin",
    Dashboard: "/dashboard",
  },
  // CONTACT INFO
  CONFIG_GENERAL_CONTACT_FOOTER_LOCATION_STRING: "New Orleans, LA - Austin, TX",
  CONFIG_GENERAL_CONTACT_FOOTER_PHONE_STRING: "Phone / Text: (630) 991-3012",
  CONFIG_GENERAL_CONTACT_FOOTER_EMAIL_STRING:
    "Email: support@customtournamentsolutions.com",
  CONFIG_GENERAL_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING:
    " Custom Tournament Solutions, 2023-Present, All Rights Reserved",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_NAME_1: "Matt Hartigan",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_NAME_2: "Cody Craig",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_EMAIL_1:
    "matthew@customtournamentsolutions.com",
  CONFIG_GENERAL_CONTACT_INFO_ADMIN_EMAIL_2:
    "cody@customtournamentsolutions.com",

  // FIREBASE
  CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME: "teams2026",
  CONFIG_GENERAL_FIREBASE_TEAMS_ID_NAME: "teamId",
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME: "catches2026",
  CONFIG_GENERAL_FIREBASE_CATCHES_ID_NAME: "catchId",
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME: "announcements2026",
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_ID_NAME: "announcementId",
  CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME: "pots2026",
  CONFIG_GENERAL_FIREBASE_POTS_ID_NAME: "potId",
  CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME: "auction2026",
  CONFIG_GENERAL_FIREBASE_AUCTION_ID_NAME: "auctionId",
};
