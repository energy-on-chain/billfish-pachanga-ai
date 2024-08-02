const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const path = require('path');
const dotenv = require('dotenv');
const admin = require("firebase-admin");
// const {firebaseStagingConfig, firebaseProductionConfig} = require("../config/firebaseConfig.js");

// ROUTES
const adminRoutes = require('./routes/adminRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const leaderboardRoutes = require('./routes/leaderboardRoutes');
// const potRoutes = require('./routes/potRoutes');

// ENVIRONMENT
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 8000;

let clientUrl;
let serverUrl;
let stripe;
let webhookSecret;

if (process.env.REACT_APP_NODE_ENV === "staging") {

  // admin.initializeApp({    // fireboase
  //   credential: admin.credential.cert({
  //     "type": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_STAGING,
  //     "project_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_STAGING,
  //     "private_key_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_STAGING,
  //     "private_key": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_STAGING.replace(/\\n/g, '\n'),
  //     "client_email": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_STAGING,
  //     "client_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_STAGING,
  //     "auth_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_STAGING,
  //     "token_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_STAGING,
  //     "auth_provider_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_STAGING,
  //     "client_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_STAGING,
  //     "universe_domain": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_STAGING
  //   }),
  //   config: firebaseStagingConfig
  // });

  // clientUrl = process.env.REACT_APP_CLIENT_URL_STAGING;    // stripe
  // serverUrl = process.env.REACT_APP_SERVER_URL_STAGING;
  // stripe = require("stripe")(process.env.REACT_APP_STRIPE_PRIVATE_KEY_TESTING);
  // webhookSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET_KEY_TESTING;

} else if (process.env.REACT_APP_NODE_ENV === "production") {

  // admin.initializeApp({    // firebase
  //   credential: admin.credential.cert({
  //     "type": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TYPE_PRODUCTION,
  //     "project_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PROJECT_ID_PRODUCTION,
  //     "private_key_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID_PRODUCTION,
  //     "private_key": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_PRODUCTION.replace(/\\n/g, '\n'),
  //     "client_email": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL_PRODUCTION,
  //     "client_id": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_ID_PRODUCTION,
  //     "auth_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_URI_PRODUCTION,
  //     "token_uri": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_TOKEN_URI_PRODUCTION,
  //     "auth_provider_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL_PRODUCTION,
  //     "client_x509_cert_url": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL_PRODUCTION,
  //     "universe_domain": process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN_PRODUCTION
  //   }),
  //   config: firebaseProductionConfig
  // });

  // clientUrl = process.env.REACT_APP_CLIENT_URL_PRODUCTION;    // stripe
  // serverUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
  // stripe = require("stripe")(process.env.REACT_APP_STRIPE_PRIVATE_KEY_PRODUCTION);
  // webhookSecret = process.env.REACT_APP_STRIPE_WEBHOOK_SECRET_KEY_PRODUCTION;

} else {
  console.log("There was an error while defining the environment")
};


// MIDDLEWARE
app.use(cors({ origin: clientUrl }));
app.use(bodyParser.json({ verify: (req, res, buf, encoding) => { req.rawBody = buf.toString() }}));
app.use('/', express.static(path.join(__dirname, '../client/build')));
// app.use('/', paymentRoutes({ clientUrl, serverUrl, stripe, webhookSecret }));
// app.use('/', adminRoutes);
// app.use('/', leaderboardRoutes);
// app.use('/', potRoutes);


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

