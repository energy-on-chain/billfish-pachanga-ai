/////////////////////////////////////////////////////////////////////////////
// REGISTRATION SETTINGS ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
module.exports = {
  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION: true,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS: "1735711200000",    // Wednesday, January 1st, 2025
  CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING:
    "Earlybird registration (before January 1st, 2025):",
  CONFIG_REGISTRATION_EARLYBIRD_FEE: 50,
  CONFIG_REGISTRATION_NORMAL_DATE_STRING:
    "Normal registration (after January 1st, 2025):",
  CONFIG_REGISTRATION_NORMAL_FEE: 60,
  CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST: [
    // "teams2024",
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
    // "Extra Wristbands": [
    //   "Each entry comes with 6 free wristbands",
    //   "Up to 12 extra wristbands can be purchased for $175 each",
    // ],
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
    // "Captain Photo"
  ],
  CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS: {
    // "Extra Wristbands": { price: 175, minimumQty: 0, maximumQty: 12 },
    // "T-shirts": { price: 20, minimumQty: 0, maximumQty: 99 },
  },
};

