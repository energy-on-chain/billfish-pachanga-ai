/////////////////////////////////////////////////////////////////////////////
// LEADERBOARD SETTINGS /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
module.exports = {
  CONFIG_LEADERBOARD_INCLUDE_PRELIMINARY_RESULTS_DISCLAIMER: true,
  CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS: "1753074000000",    // Monday, 21-July-2025 00:00 AM
  // CONFIG_LEADERBOARD_PRELIMINARY_RESULTS_DISCLAIMER_CUTOFF_IN_LOCAL_TIME_IN_MS: "1721538000000",    // TEST: Sunday, 21-July-2024 00:00 AM
  CONFIG_LEADERBOARD_CATEGORIES: [

    // Tournament Grand Champion
    { 
      title: "Tournament Grand Champion", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_tournament_grand_champion",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},  
      ]
    },

    // Overall Billfish Champion
    { 
      title: "Overall Billfish Champion", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_overall_billfish_champion",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },

    // Grand Slams
    { 
      title: "Grand Slams", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_grand_slams",     
      inputs: [
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 2, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'firstCatchBlueMarlin', headerName: 'Blue Marlin', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchWhiteMarlin', headerName: 'White Marlin', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchSailfish', headerName: 'Sailfish', flex: 3, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 100, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', width: 200, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'firstCatchBlueMarlin', headerName: 'Blue Marlin', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchWhiteMarlin', headerName: 'White Marlin', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
        { field: 'firstCatchSailfish', headerName: 'Sailfish', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },

    // Billfish Day Champions
    { 
      title: "Billfish Champion - Day 1", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_billfish_day_champion",     
      inputs: [
        {day: "2024-07-18"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },
    { 
      title: "Billfish Champion - Day 2", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_billfish_day_champion",     
      inputs: [
        {day: "2024-07-19"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },
    { 
      title: "Billfish Champion - Day 3", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_billfish_day_champion",     
      inputs: [
        {day: "2024-07-20"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },

    // Billfish Species Champions
    { 
      title: "Blue Marlin", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_billfish_species_champion",     
      inputs: [
        {species: "Blue Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },
    { 
      title: "White Marlin", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_billfish_species_champion",     
      inputs: [
        {species: "White Marlin"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },
    { 
      title: "Sailfish", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_billfish_species_champion",     
      inputs: [
        {species: "Sailfish"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'points', headerName: 'Points', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'lastCatch', headerName: 'Time of Last Catch', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'points', headerName: 'Points', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'lastCatch', headerName: 'Time of Last Catch', width: 300, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: true},
      ]
    },

    // Meatfish Species Champions
    { 
      title: "Dorado", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_meatfish_species_champion",     
      inputs: [
        {species: "Dorado"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ]
    },
    { 
      title: "Tuna", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_meatfish_species_champion",     
      inputs: [
        {species: "Tuna"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ]
    },
    { 
      title: "Wahoo", 
      subtitle: "",
      numPlaces: 5, 
      numTrophies: 3, 
      url: "get_billfish_pachanga_meatfish_species_champion",     
      inputs: [
        {species: "Wahoo"}
      ],
      desktopColumns: [
        { field: 'place', headerName: 'Place', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'team', headerName: 'Team', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'weight', headerName: 'Points (Weight, lbs)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', flex: 1, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ],
      mobileColumns: [
        { field: 'place', headerName: 'Place', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'team', headerName: 'Team', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center'},
        { field: 'weight', headerName: 'Points (Weight, lbs)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
        { field: 'length', headerName: 'Length (in)', width: 150, headerClassName: 'super-app-theme--header', headerAlign: 'center', align: 'center', isDateTime: false},
      ]
    },

  ],
};

