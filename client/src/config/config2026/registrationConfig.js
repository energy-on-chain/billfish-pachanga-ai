/////////////////////////////////////////////////////////////////////////////
// REGISTRATION SETTINGS ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
export default {
  // Set to false once registration prices and earlybird dates are officially confirmed.
  // While true: the register page shows a "pricing pending" notice and the button is disabled.
  CONFIG_REGISTRATION_PRICES_PENDING_CONFIRMATION: true,

  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION: true,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS: "1781499600000",    // Monday, June 15th 2026 at 00:00AM CDT
  CONFIG_REGISTRATION_CUTOFF_IN_LOCAL_TIME_IN_MS: "1784437200000",              // Sunday, July 19th 2026 at 00:00AM CDT
  CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING:
    "Earlybird registration (before June 15th, 2026):",
  CONFIG_REGISTRATION_EARLYBIRD_FEE: 3000,
  CONFIG_REGISTRATION_NORMAL_DATE_STRING:
    "Normal registration (June 15th, 2026 onwards):",
  CONFIG_REGISTRATION_NORMAL_FEE: 4000,
  CONFIG_REGISTRATION_LINK_TO_TOURNAMENT_RULES: "https://www.billfishpachanga.com/rules/",
  CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST: [
    "teams2025",
  ],
  CONFIG_REGISTRATION_HAS_DISCLAIMERS: true,
  CONFIG_REGISTRATION_DISCLAIMERS: {
    Weather: [
      "It is up to the Tournament Director's discretion to reschedule or cancel due to weather.",
      "By entering this tournament participants agree to abide by all rules and decisions.",
      "All decisions made by the weigh master and/or tournament directors are final.",
    ],
    // Refunds: [
    //   "It is the intent of the tournament committee to refund 50% of entry fees if the tournament is cancelled.",
    // ],
  },
  CONFIG_REGISTRATION_PAID_ADD_ONS: {
    "Extra Wristbands": [
      "Each entry comes with 6 free wristbands",
      "Up to 12 extra wristbands can be purchased for $200 each",
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
    // "Team Photo"
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
    "Boat Photo"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS: {
    "Extra Wristbands": { price: 200, minimumQty: 0, maximumQty: 12 },
    // "T-shirts": { price: 20, minimumQty: 0, maximumQty: 99 },
  },
};
