/////////////////////////////////////////////////////////////////////////////
// DASHBOARD SETTINGS ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
module.exports = {
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
  CONFIG_DASHBOARD_UPCOMING_AND_ACTIVE_TOURNAMENT_DATA: [
    {
      logo: './BillfishPachangaLogo2026.png',
      title: "Billfish Pachanga 2026",
      dates: "July 15th - 18th 2026",
      home: "/2026/home",
      register: "/2026/register",
      leaderboard: "/2026/leaderboard",
      pots: "/2026/pots",
      newsfeed: "/2026/newsfeed",
      auction: null,
      admin: "/2026/admin",
    },
  ],

  CONFIG_DASHBOARD_PAST_TOURNAMENT_DATA: [
    {
      logo: './BillfishPachangaLogo2025.png',
      title: "Billfish Pachanga 2025",
      dates: "July 16th - 19th 2025",
      home: "/2025/home",
      register: "/2025/register",
      leaderboard: "/2025/leaderboard",
      pots: "/2025/pots",
      newsfeed: "/2025/newsfeed",
      auction: null,
      admin: "/2025/admin",
    },
    {
      logo: './BillfishPachangaLogo2024.png',
      title: "Billfish Pachanga 2024",
      dates: "July 17th - 20th 2024",
      home: "/2024/home",
      register: "/2024/register",
      leaderboard: "/2024/leaderboard",
      pots: "/2024/pots",
      newsfeed: "/2024/newsfeed",
      auction: null,
      admin: "/2024/admin",
    },
    {
      logo: './BillfishPachangaLogo2023.png',
      title: "Billfish Pachanga 2023",
      dates: "July 12th - 15th 2023",
      home: "/2023/home",
      register: "/2023/register",
      leaderboard: "/2023/leaderboard",
      pots: "/2023/pots", 
      newsfeed: "/2023/newsfeed",
      auction: null,
      admin: "/2023/admin",
    },
  ],
};

