const express = require('express');
const bodyParser = require("body-parser");

module.exports = ({ clientUrl, serverUrl, stripe, webhookSecret, redisClient }) => {
  const router = express.Router();
  const { 
    registrationGetPastTeamNameList, 
    registrationCheckoutSession, 
    registrationWebhook,
    registrationGetNumberOfRegisteredTeams,
    registrationGetNumberOfCheckedInTeams,
    registrationGetTotalFeesCollected,
    registrationGetTotalRegistrationFeesCollected,
    registrationGetTotalAddOnFeesCollected,
    upload  
  } = require('../controllers/registrationControllers')({ clientUrl, serverUrl, stripe, webhookSecret, redisClient });

  router.post('/api/:year/registration_get_past_team_name_list', registrationGetPastTeamNameList);
  router.post('/api/:year/registration_checkout_session', upload.fields([
    { name: 'requiredImageUploads', maxCount: 10 },
    { name: 'imageUploads', maxCount: 10 }
  ]), registrationCheckoutSession);
  router.post('/api/registration_webhook', bodyParser.raw({ type: 'application/json' }), registrationWebhook);
  router.post('/api/:year/registration_get_number_of_registered_teams', registrationGetNumberOfRegisteredTeams);
  router.post('/api/:year/registration_get_number_of_checked_in_teams', registrationGetNumberOfCheckedInTeams);
  router.post('/api/:year/registration_get_total_fees_collected', registrationGetTotalFeesCollected);
  router.post('/api/:year/registration_get_total_registration_fees_collected', registrationGetTotalRegistrationFeesCollected);
  router.post('/api/:year/registration_get_total_add_on_fees_collected', registrationGetTotalAddOnFeesCollected);

  return router;
};

