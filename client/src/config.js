module.exports = {
  /////////////////////////////////////////////////////////////////////////////
  // 1. General Settings //////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_GENERAL_TOURNAMENT_NAME: "Billfish Pachanga",
  CONFIG_GENERAL_YEAR: "2025",
  CONFIG_GENERAL_HAS_INFO: true,
  CONFIG_GENERAL_HAS_REGISTRATION: true,
  CONFIG_GENERAL_HAS_LEADERBOARD: true,
  CONFIG_GENERAL_HAS_CATCHES: true,
  CONFIG_GENERAL_HAS_ADMIN: true,
  CONFIG_GENERAL_HAS_STATS_TAB: true,
  CONFIG_GENERAL_HAS_REPORTS_TAB: true,
  CONFIG_GENERAL_HAS_POTS: true,
  CONFIG_GENERAL_HAS_AUCTION: false,
  CONFIG_GENERAL_LINK_TO_TOURNAMENT_WEBSITE: "https://www.billfishpachanga.com/",
  CONFIG_GENERAL_LINK_TO_TOURNAMENT_RULES: "https://www.billfishpachanga.com/rules/",
  CONFIG_GENERAL_TOURNAMENT_LINK_OBJECT: {
    "Register": "/register",
    "Leaderboard": "/leaderboard",
    "Catches": "/catches",
    "Pots": "/pots",
    "Auction": "/auction",
  },
  CONFIG_GENERAL_INFO_LINK_OBJECT: {
    "Tournament Site": "https://www.billfishpachanga.com/",
    "Rules": "https://www.billfishpachanga.com/rules/"
  },
  CONFIG_CONTACT_FOOTER_LOCATION_STRING: "Austin, TX    -    New Orleans, LA",    // Contact info
  CONFIG_CONTACT_FOOTER_PHONE_STRING: "Phone / Text: (903) 235-5195",
  CONFIG_CONTACT_FOOTER_EMAIL_STRING: "Email: info@customtournamentsolutions.com",
  CONFIG_CONTACT_FOOTER_COMPANY_COPYRIGHT_STRING: " Custom Tournament Solutions, 2023-Present, All Rights Reserved",
  CONFIG_CONTACT_INFO_ADMIN_NAME_1: "Cody Craig",
  CONFIG_CONTACT_INFO_ADMIN_NAME_2: "Matt Hartigan",
  CONFIG_CONTACT_INFO_ADMIN_EMAIL_1: "cody@arrowheadecology.com",
  CONFIG_CONTACT_INFO_ADMIN_EMAIL_2: "matthew@deepwaterdigital.tech",
  CONFIG_FIREBASE_TEAMS_TABLE_NAME: "teams2025",    // Firebase
  CONFIG_FIREBASE_TEAMS_ID_NAME: "teamId",    
  CONFIG_FIREBASE_CATCHES_TABLE_NAME: "catches2025",
  CONFIG_FIREBASE_CATCHES_ID_NAME: "catchId",
  CONFIG_FIREBASE_POTS_TABLE_NAME: "pots2025",
  CONFIG_FIREBASE_POTS_ID_NAME: "potId",
  CONFIG_FIREBASE_AUCTION_TABLE_NAME: "auction2025",
  CONFIG_FIREBASE_AUCTION_ID_NAME: "auctionId",
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
  // FIXME: Styling
  /////////////////////////////////////////////////////////////////////////////
  // 2. Home Page Settings ////////////////////////////////////////////////////
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
  // 3. Registration Page Settings ////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION: true,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS: "1750050000000",
  CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING: "Earlybird registration (before June 16th):",
  CONFIG_REGISTRATION_EARLYBIRD_FEE: 2750,
  CONFIG_REGISTRATION_NORMAL_DATE_STRING: "Normal registration (after June 16th):",
  CONFIG_REGISTRATION_NORMAL_FEE: 3500,
  CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST: [
    "teams2024"
  ],
  CONFIG_REGISTRATION_HAS_DISCLAIMERS: true,
  CONFIG_REGISTRATION_DISCLAIMERS: {
    "Weather": [
      "It is up to the Tournament Director's discretion to reschedule or cancel due to weather.",
      "By entering this tournament participants agree to abide by all rules and decisions.",
      "All decisions made by the weigh master and/or tournament directors are final.",
    ],
    "Refunds": [
      "It is the intent of the tournament committee to refund 50% of entry fees if the tournament is cancelled."
    ],
  },
  CONFIG_REGISTRATION_PAID_ADD_ONS: {
    "Extra Wristbands": [
      "Each entry comes with 6 free wristbands",
      "Up to 12 extra wristbands can be purchased for $175 each"
    ],
  },

  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_STRING_FIELDS: [
    // "Hometown"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_INT_FIELDS: [
    // "Boat Length (ft)"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_BOOLEAN_FIELDS: [
    // "Sonar?"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_DROPDOWN_FIELDS: {
    // "Division": ["Kayak", "Offshore", "Bay/Surf"],
  },
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_IMAGE_FIELDS: [
    "Team Photo"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_STRING_FIELDS: [
    // "Zodiac"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_INT_FIELDS: [
    // "Age (years)"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_BOOLEAN_FIELDS: [
    // "Under 21?"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_DROPDOWN_FIELDS: {
    // "Gender": ["Male", "Female"],
  },
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_IMAGE_FIELDS: [
    "Captain Photo"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS: {
    "Extra Wristbands": {"price": 175, "minimumQty": 0, "maximumQty": 12},
    "T-shirts": {"price": 20, "minimumQty": 0, "maximumQty": 99},
  },
  /////////////////////////////////////////////////////////////////////////////
  // 5. ADMIN PAGE SETTINGS////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_ADMIN_DEFAULT_TAB_NAME: "Catches",
  CONFIG_ADMIN_DEFAULT_TAB_NAME_LIST: [
    "Teams",
    // "Catches",
    // "Pots",
    // "Auction",
    "Stats",
    "Reports",
  ],
  CONFIG_ADMIN_TOURNAMENT_START_DATE_STRING: "2024-07-19",
  CONFIG_ADMIN_TOURNAMENT_END_DATE_STRING: "2024-07-21",
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS: [
    // Standard
    {field: "teamId", headerName: "Team ID", type: "string", isEditable: false, isRequired: true, isVisible: false, flex: 3, width: 300, isId: true, isCurrency: false, isPhoneNumber: false, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "teamName", headerName: "Team", type: "string", isEditable: true, isRequired: true, isVisible: true, flex: 3, width: 300, isId: false, isCurrency: false, isPhoneNumber: false, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "isEarlybird", headerName: "Earlybird?", type: "boolean", isEditable: false, isRequired: true, isVisible: false, flex: 2, width: 200, isId: false, isCurrency: false, isPhoneNumber: true, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "teamEmail", headerName: "Email", type: "string", isEditable: true, isRequired: true, isVisible: true, flex: 4, width: 400, isId: false, isPhoneNumber: false, isCurrency: false, isEmail: true, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "teamPhone", headerName: "Phone", type: "string", isEditable: true, isRequired: true, isVisible: true, flex: 2, width: 200, isId: false, isPhoneNumber: true, isCurrency: false, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "teamCardholderName", headerName: "Cardholder Name", type: "string", isEditable: false, isRequired: true, isVisible: false, flex: 2, width: 200, isId: false, isCurrency: false, isPhoneNumber: false, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "teamPaymentStatus", headerName: "Has Paid", type: "string", isEditable: false, isRequired: true, isVisible: false, flex: 2, width: 200, isId: false, isCurrency: false, isPhoneNumber: true, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "totalFeePaidAtCheckout", headerName: "Total Fee ($)", type: "number", isEditable: false, isRequired: true, isVisible: true, flex: 2, width: 200, isId: false, isCurrency: true, isPhoneNumber: false, isEmail: false, isDateTime: false, isImage: false,  isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "hasCheckedIn", headerName: "Checked-In?", type: "boolean", isEditable: true, isRequired: true, isVisible: true, flex: 2, width: 200, isId: false, isCurrency: false, isPhoneNumber: true, isEmail: false, isDateTime: false, isImage: false, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "registrationFee", headerName: "Registration Fee ($)", type: "number", isEditable: false, isRequired: false, isVisible: false, flex: 2, width: 200, isId: false, isCurrency: true, isPhoneNumber: false, isEmail: false, isDateTime: false, isImage: false,  isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "registrationTimestampInLocalTime", headerName: "Time of Registration", type: "dateTime", isEditable: false, isRequired: true, isVisible: true, flex: 3, width: 300, isId: false, isCurrency: false, isPhoneNumber: false, isEmail: false, isDateTime: true, isImage: false,  isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    // Required images
    {field: "Team Photo", headerName: "Team Photo", type: "image", isEditable: true, isRequired: true, isVisible: false, flex: 2, width: 200, valueFormatter: null, isId: false, isCurrency: false, isPhoneNumber: true, isEmail: false, isDateTime: false, isImage: true, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    // Unrequired images
    {field: "Captain Photo", headerName: "Captain Photo", type: "image", isEditable: true, isRequired: false, isVisible: false, flex: 2, width: 200, valueFormatter: null, isId: false, isCurrency: false, isPhoneNumber: true, isEmail: false, isDateTime: false, isImage: true, isAddOnCharge: false, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    // Add on charges
    {field: "Extra Wristbands", headerName: "# Extra Wristbands", type: "number", isEditable: false, isRequired: true, isVisible: true, flex: 3, width: 300, valueFormatter: null, isId: false, isCurrency: false, isPhoneNumber: false, isEmail: false, isDateTime: false, isImage: false,  isAddOnCharge: true, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
    {field: "T-shirts", headerName: "# T-shirts", type: "number", isEditable: false, isRequired: true, isVisible: true, flex: 2, width: 200, valueFormatter: null, isId: false, isPhoneNumber: false, isCurrency: false, isEmail: false, isDateTime: false, isImage: false,  isAddOnCharge: true, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
  ],
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES: [
  ],
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_POTS: [
  ],
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_AUCTIONS: [
  ],
  /////////////////////////////////////////////////////////////////////////////
  // 6. CATCHES PAGE SETTINGS//////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  // 7. LEADERBOARD PAGE SETTINGS//////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_LEADERBOARD_NUMBER_OF_PLACES_TO_DISPLAY: [
    {title: "FIXME", numPlaces: 3},
  ],
  /////////////////////////////////////////////////////////////////////////////
  // 8. POTS PAGE SETTINGS/////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  CONFIG_POTS_NUMBER_OF_PLACES_TO_DISPLAY: [
    {title: "FIXME", numPlaces: 3},
  ],
  /////////////////////////////////////////////////////////////////////////////
  // 9. AUCTION PAGE SETTINGS//////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
}

