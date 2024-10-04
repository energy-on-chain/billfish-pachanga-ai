const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require('path');
const dotenv = require('dotenv');
const admin = require("firebase-admin");    // firebase
const {firebaseStagingConfig, firebaseProductionConfig} = require("../client/src/config/dashboardConfig.js");
const session = require('express-session');
const RedisStore = require('connect-redis').default; // Corrected way to import connect-redis
const redis = require('redis');

// ROUTES
const homeRoutes = require('./routes/homeRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const newsfeedRoutes = require('./routes/newsfeedRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const potRoutes = require('./routes/potRoutes');
// const auctionRoutes = require('./routes/auctionRoutes');

// ENVIRONMENT
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 8000;

let clientUrl;    // stripe
let serverUrl;
let stripe;
let webhookSecret;

let redisHost;    // sessions
let sessionSecret;    

if (process.env.REACT_APP_NODE_ENV === "staging") {

  admin.initializeApp({    // firebase
    credential: admin.credential.cert({
      "type": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_STAGING,
      "project_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_STAGING,
      "private_key_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_STAGING,
      "private_key": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_STAGING.replace(/\\n/g, '\n'),
      "client_email": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_STAGING,
      "client_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_STAGING,
      "auth_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_STAGING,
      "token_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_STAGING,
      "auth_provider_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_STAGING,
      "client_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_STAGING,
      "universe_domain": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_STAGING
    }),
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_STAGING,
    config: firebaseStagingConfig
  });

  clientUrl = process.env.REACT_APP_CLIENT_URL_STAGING;    // stripe
  serverUrl = process.env.REACT_APP_SERVER_URL_STAGING;
  stripe = require("stripe")(process.env.REACT_APP_STRIPE_PRIVATE_KEY_TESTING);
  webhookSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET_KEY_TESTING;

  redisHost: process.env.REACT_APP_CLIENT_URL_STAGING;    // session
  sessionSecret = process.env.REACT_APP_SESSION_SECRET_KEY_STAGING;   

} else if (process.env.REACT_APP_NODE_ENV === "production") {

  admin.initializeApp({    // firebase
    credential: admin.credential.cert({
      "type": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_PRODUCTION,
      "project_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_PRODUCTION,
      "private_key_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_PRODUCTION,
      "private_key": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_PRODUCTION.replace(/\\n/g, '\n'),
      "client_email": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_PRODUCTION,
      "client_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_PRODUCTION,
      "auth_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_PRODUCTION,
      "token_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_PRODUCTION,
      "auth_provider_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_PRODUCTION,
      "client_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_PRODUCTION,
      "universe_domain": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_PRODUCTION
    }),
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_PRODUCTION,
    config: firebaseProductionConfig
  });

  clientUrl = process.env.REACT_APP_CLIENT_URL_PRODUCTION;    // stripe
  serverUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
  stripe = require("stripe")(process.env.REACT_APP_STRIPE_PRIVATE_KEY_PRODUCTION);
  webhookSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET_KEY_PRODUCTION;

  redisHost: process.env.REACT_APP_CLIENT_URL_PRODUCTION;    // session
  sessionSecret = process.env.REACT_APP_SESSION_SECRET_KEY_PRODUCTION;  

} else {
  console.log("There was an error while defining the environment")
};

// REDIS
const redisUrl = process.env.REDIS_TLS_URL || 'redis://127.0.0.1:6379'; // Use REDIS_URL from environment or default to local Redis
const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    tls: (redisUrl.match(/rediss:/) != null),
    rejectUnauthorized: false,
  }
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('ready', () => console.log('Redis client ready'));
redisClient.on('end', () => console.log('Redis client disconnected'));
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

// MIDDLEWARE
const allowedOrigins = [
  clientUrl,
  serverUrl,
  'https://www.billfishpachanga.customtournamentsolutions.com',
  'https://billfishpachanga.customtournamentsolutions.com',
  'https://billfish-pachanga-staging-29e5a342e094.herokuapp.com',
  'https://billfish-pachanga-production-ae9f4209fe66.herokuapp.com'
];
// app.use(cors({ origin: clientUrl }));
app.use(cors({
  origin: (origin, callback) => {
    console.log('Origin: ', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error('Not allowed by CORS')); // Origin not allowed
    }
  },
  credentials: true // Allow cookies and credentials to be sent in the requests
}));
app.use(bodyParser.json({ verify: (req, res, buf, encoding) => { req.rawBody = buf.toString() }}));
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: sessionSecret, // Replace with your secret key
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.REACT_APP_NODE_ENV === 'production' || process.env.REACT_APP_NODE_ENV === 'staging',
    httpOnly: true,  // Helps to prevent cross-site scripting attacks by ensuring the cookie is only accessible via HTTP(S)
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week (adjust as needed)
  }
}));
app.use('/', express.static(path.join(__dirname, '../client/build')));
app.use('/', homeRoutes);
app.use('/', registrationRoutes({ clientUrl, serverUrl, stripe, webhookSecret, redisClient }));
app.use('/', adminRoutes ({redisClient}));
app.use('/', newsfeedRoutes);
app.use('/', leaderboardRoutes);
app.use('/', potRoutes);
// app.use('/', auctionRoutes);


// REDIRECT
if (process.env.REACT_APP_NODE_ENV === "staging" || process.env.REACT_APP_NODE_ENV === "production") {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// LISTEN
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

