const express = require('express');
const router = express.Router();
const {
  getRegistrantCountForHomepage,
  getCatchCountForHomepage,
} = require('../controllers/homeControllers');

router.post('/api/:year/get_registrant_count_for_homepage', getRegistrantCountForHomepage);
router.post('/api/:year/get_catch_count_for_homepage', getCatchCountForHomepage);

module.exports = router;

