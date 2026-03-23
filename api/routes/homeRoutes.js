const express = require('express');
const router = express.Router();
const cache = require('../services/cache');
const {
  getRegistrantCountForHomepage,
  getCatchCountForHomepage,
} = require('../controllers/homeControllers');

const c = cache.middleware(60);

router.post('/api/:year/get_registrant_count_for_homepage', c, getRegistrantCountForHomepage);
router.post('/api/:year/get_catch_count_for_homepage', c, getCatchCountForHomepage);

module.exports = router;
