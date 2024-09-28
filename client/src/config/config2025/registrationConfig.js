/////////////////////////////////////////////////////////////////////////////
// REGISTRATION SETTINGS ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
module.exports = {
  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION: true,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS: "1749963600000",    // Sunday, June 15th 2025 at 00:00AM
  CONFIG_REGISTRATION_CUTOFF_IN_LOCAL_TIME_IN_MS: "1721538000000",    // Sunday, 21-July-2024 at 00:00 AM  (FIXME)
  // CONFIG_REGISTRATION_CUTOFF_IN_LOCAL_TIME_IN_MS: "1753074000000",    // Sunday, 21-July-2025 at 00:00 AM (FIXME)
  CONFIG_REGISTRATION_EARLYBIRD_DATE_STRING:
    "Earlybird registration (date TBD):",
  CONFIG_REGISTRATION_EARLYBIRD_FEE: "TBD",
  // CONFIG_REGISTRATION_EARLYBIRD_FEE: 2750,
  CONFIG_REGISTRATION_NORMAL_DATE_STRING:
    "Normal registration (date TBD):",
  CONFIG_REGISTRATION_NORMAL_FEE: "TBD",
  // CONFIG_REGISTRATION_NORMAL_FEE: 3500,
  CONFIG_REGISTRATION_LINK_TO_TOURNAMENT_RULES: "https://www.billfishpachanga.com/rules/",
  CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST: [
    // "teams2023",
    "teams2024",
  ],
  CONFIG_REGISTRATION_HAS_DISCLAIMERS: true,
  CONFIG_REGISTRATION_DISCLAIMERS: {
    // Weather: [
    //   "It is up to the Tournament Director's discretion to reschedule or cancel due to weather.",
    //   "By entering this tournament participants agree to abide by all rules and decisions.",
    //   "All decisions made by the weigh master and/or tournament directors are final.",
    // ],
    // Refunds: [
    //   "It is the intent of the tournament committee to refund 50% of entry fees if the tournament is cancelled.",
    // ],
  },
  CONFIG_REGISTRATION_PAID_ADD_ONS: {
    "Extra Wristbands": [
      "All prices will be announced soon!"
      // "Each entry comes with 6 free wristbands",
      // "Up to 12 extra wristbands can be purchased for $175 each",
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
    // "Extra Wristbands": { price: 175, minimumQty: 0, maximumQty: 12 },
    // "T-shirts": { price: 20, minimumQty: 0, maximumQty: 99 },
  },
};
