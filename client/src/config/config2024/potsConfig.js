/////////////////////////////////////////////////////////////////////////////
// POT SETTINGS /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
export default {
  CONFIG_POTS_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER: true,
  CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS: "1721538000000",    // Sunday, 21-July-2024 at 00:00 AM
  // CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS: "1753074000000",    // TEST: Monday, 21-July-2025 00:00 AM
  // CONFIG_POTS_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS: "1721538000000",    // TEST: Sunday, 21-July-2024 00:00 AM
  CONFIG_POTS_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS: [
    { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
    { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
  ],
  CONFIG_POTS_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS: [
    { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
    { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
  ],
  CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_DESKTOP_COLUMN_DEFINITIONS: [
    { field: 'potName', headerName: 'Pot', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
    { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
    { field: 'payout', headerName: 'Payout', flex: 2, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
  ],
  CONFIG_POTS_INDIVIDUAL_TEAM_SUMMARY_MOBILE_COLUMN_DEFINITIONS: [
    { field: 'potName', headerName: 'Pot', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
    { field: 'place', headerName: 'Place', width: 75, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
    { field: 'payout', headerName: 'Payout', width: 125, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
  ],
  CONFIG_POTS_BOARD_LIST: [
    {"Captain & Mate": [
      {title: "Mates Pot ($250)", amount: 250, tournamentCut: 0.08},
      {title: "Captains Pot ($500)", amount: 500, tournamentCut: 0.08},
    ]},
    {"Billfish": [
      {title: "Blue Marlin ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "Blue Marlin ($2,000)", amount: 2000, tournamentCut: 0.08},
      {title: "Blue Marlin ($3,000)", amount: 3000, tournamentCut: 0.08},
      {title: "White Marlin or Spearfish ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "White Marlin or Spearfish ($2,000)", amount: 2000, tournamentCut: 0.08},
      {title: "White Marlin or Spearfish ($3,000)", amount: 3000, tournamentCut: 0.08},
      {title: "Sailfish ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "Sailfish ($2,000)", amount: 2000, tournamentCut: 0.08},
      {title: "Sailfish ($3,000)", amount: 3000, tournamentCut: 0.08},
      {title: "Overall Billfish ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "Overall Billfish ($2,000)", amount: 2000, tournamentCut: 0.08},
      {title: "Overall Billfish ($3,000)", amount: 3000, tournamentCut: 0.08},
      {title: "Grand Slam ($3,000)", amount: 3000, tournamentCut: 0.08},
      {title: "Grand Overall ($3,000)", amount: 3000, tournamentCut: 0.08},
      {title: "Overall Billfish Dailies - Day 1 ($3,500)", amount: 3500, tournamentCut: 0.08},
      {title: "Overall Billfish Dailies - Day 2 ($3,500)", amount: 3500, tournamentCut: 0.08},
      {title: "Overall Billfish Dailies - Day 3 ($3,500)", amount: 3500, tournamentCut: 0.08},
      {title: "Non-Sonar Billfish Release ($1,500)", amount: 1500, tournamentCut: 0.08},
      {title: "Non-Sonar Billfish Release ($2,000)", amount: 2000, tournamentCut: 0.08},
      {title: "Non-Sonar Billfish Release ($3,000)", amount: 3000, tournamentCut: 0.08},
    ]},
    {"Meatfish": [
      {title: "Dorado ($500)", amount: 500, tournamentCut: 0.08},
      {title: "Dorado ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "Dorado ($1,500)", amount: 1500, tournamentCut: 0.08},
      {title: "Wahoo ($500)", amount: 500, tournamentCut: 0.08},
      {title: "Wahoo ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "Wahoo ($1,500)", amount: 1500, tournamentCut: 0.08},
      {title: "Tuna ($500)", amount: 500, tournamentCut: 0.08},
      {title: "Tuna ($1,000)", amount: 1000, tournamentCut: 0.08},
      {title: "Tuna ($1,500)", amount: 1500, tournamentCut: 0.08},
    ]},

  ],
  CONFIG_POTS_CATEGORIES: [

    // Tournament Grand Champion
    { 
      title: "Tournament Grand Champion", 
      subtitle: "",
      potName: "Grand Overall ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 1.0,
        2: 0.0,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_tournament_grand_champion_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},  
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

    // Overall Billfish Champion
    { 
      title: "Overall Billfish Champion ($1,000)", 
      subtitle: "",
      potName: "Overall Billfish ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_overall_billfish_champion_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Overall Billfish Champion ($2,000)", 
      subtitle: "",
      potName: "Overall Billfish ($2,000)",
      entryAmount: 2000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_overall_billfish_champion_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Overall Billfish Champion ($3,000)", 
      subtitle: "",
      potName: "Overall Billfish ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_overall_billfish_champion_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

    // Grand Slams
    { 
      title: "Grand Slam ($3,000)", 
      subtitle: "",
      potName: "Grand Slam ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 1.0,
        2: 0.0,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_grand_slams_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 2, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'firstCatchBlueMarlin', headerName: 'Blue Marlin', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchWhiteMarlin', headerName: 'White Marlin', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchSailfish', headerName: 'Sailfish', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 100, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'firstCatchBlueMarlin', headerName: 'Blue Marlin', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchWhiteMarlin', headerName: 'White Marlin', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchSailfish', headerName: 'Sailfish', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

    // Billfish Day Champions
    { 
      title: "Billfish Champion - Day 1", 
      subtitle: "",
      potName: "Overall Billfish Dailies - Day 1 ($3,500)",
      entryAmount: 3500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.8,
        2: 0.2,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_day_champion_pot_standings",     
      inputs: [
        {day: "2024-07-18"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Billfish Champion - Day 2", 
      subtitle: "",
      potName: "Overall Billfish Dailies - Day 2 ($3,500)",
      entryAmount: 3500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.8,
        2: 0.2,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_day_champion_pot_standings",     
      inputs: [
        {day: "2024-07-19"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Billfish Champion - Day 3", 
      subtitle: "",
      potName: "Overall Billfish Dailies - Day 3 ($3,500)",
      entryAmount: 3500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.8,
        2: 0.2,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_day_champion_pot_standings",     
      inputs: [
        {day: "2024-07-20"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

    // Non-Sonar Billfish Release
    { 
      title: "Non-Sonar Billfish Release ($1,500)", 
      subtitle: "",
      potName: "Non-Sonar Billfish Release ($1,500)",
      entryAmount: 1500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_overall_billfish_non_sonar_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Non-Sonar Billfish Release ($2,000)", 
      subtitle: "",
      potName: "Non-Sonar Billfish Release ($2,000)",
      entryAmount: 2000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_overall_billfish_non_sonar_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Non-Sonar Billfish Release ($3,000)", 
      subtitle: "",
      potName: "Non-Sonar Billfish Release ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_overall_billfish_non_sonar_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

    // Billfish Species Champions
    { 
      title: "Blue Marlin ($1,000)", 
      subtitle: "",
      potName: "Blue Marlin ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "Blue Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Blue Marlin ($2,000)", 
      subtitle: "",
      potName: "Blue Marlin ($2,000)",
      entryAmount: 2000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "Blue Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Blue Marlin ($3,000)", 
      subtitle: "",
      potName: "Blue Marlin ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "Blue Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "White Marlin ($1,000)", 
      subtitle: "",
      potName: "White Marlin or Spearfish ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "White Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "White Marlin ($2,000)", 
      subtitle: "",
      potName: "White Marlin or Spearfish ($2,000)",
      entryAmount: 2000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "White Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "White Marlin ($3,000)", 
      subtitle: "",
      potName: "White Marlin or Spearfish ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "White Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Sailfish ($1,000)", 
      subtitle: "",
      potName: "Sailfish ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "Sailfish"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Sailfish ($2,000)", 
      subtitle: "",
      potName: "Sailfish ($2,000)",
      entryAmount: 2000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "Sailfish"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Sailfish ($3,000)", 
      subtitle: "",
      potName: "Sailfish ($3,000)",
      entryAmount: 3000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_billfish_species_champion_pot_standings",     
      inputs: [
        {species: "Sailfish"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

    // Meatfish Species Champions
    { 
      title: "Dorado ($500)", 
      subtitle: "",
      potName: "Dorado ($500)",
      entryAmount: 500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Dorado"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Dorado ($1,000)", 
      subtitle: "",
      potName: "Dorado ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Dorado"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Dorado ($1,500)", 
      subtitle: "",
      potName: "Dorado ($1,500)",
      entryAmount: 1500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Dorado"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Wahoo ($500)", 
      subtitle: "",
      potName: "Wahoo ($500)",
      entryAmount: 500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Wahoo"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Wahoo ($1,000)", 
      subtitle: "",
      potName: "Wahoo ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Wahoo"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Wahoo ($1,500)", 
      subtitle: "",
      potName: "Wahoo ($1,500)",
      entryAmount: 1500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Wahoo"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Tuna ($500)", 
      subtitle: "",
      potName: "Tuna ($500)",
      entryAmount: 500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Tuna"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Tuna ($1,000)", 
      subtitle: "",
      potName: "Tuna ($1,000)",
      entryAmount: 1000,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Tuna"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Tuna ($1,500)", 
      subtitle: "",
      potName: "Tuna ($1,500)",
      entryAmount: 1500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.7,
        2: 0.3,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_meatfish_species_champion_pot_standings",     
      inputs: [
        {species: "Tuna"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    
    
    
    // Captain & Mate Pots
    { 
      title: "Captain Pot", 
      subtitle: "",
      potName: "Captains Pot ($500)",
      entryAmount: 500,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.8,
        2: 0.2,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_captain_and_mate_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},  
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },
    { 
      title: "Mate Pot", 
      subtitle: "",
      potName: "Mates Pot ($250)",
      entryAmount: 250,
      tournamentCut: 0.08,
      payoutStructure: {
        1: 0.8,
        2: 0.2,
        3: 0.0,
        4: 0.0,
        5: 0.0,
      },
      url: "get_billfish_pachanga_captain_and_mate_pot_standings",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'payout', headerName: 'Payout', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: false},  
        { field: 'payout', headerName: 'Payout', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false, isCurrency: true},
      ]
    },

  ],
}

