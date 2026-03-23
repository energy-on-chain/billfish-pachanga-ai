const express = require('express');
const router = express.Router();
const cache = require('../services/cache');
const {
  getTypeCountDataForNewsfeedTable,
  getSpeciesCountDataForNewsfeedTable,
  getTeamCountDataForNewsfeedTable,
  getDateCountDataForNewsfeedTable,
  getEventDataForNewsfeedTable,
} = require('../controllers/newsfeedControllers');

const c = cache.middleware(60);

router.post('/api/:year/get_type_count_data_for_newsfeed_table', c, getTypeCountDataForNewsfeedTable);
router.post('/api/:year/get_species_count_data_for_newsfeed_table', c, getSpeciesCountDataForNewsfeedTable);
router.post('/api/:year/get_team_count_data_for_newsfeed_table', c, getTeamCountDataForNewsfeedTable);
router.post('/api/:year/get_date_count_data_for_newsfeed_table', c, getDateCountDataForNewsfeedTable);
router.post('/api/:year/get_event_data_for_newsfeed_table', c, getEventDataForNewsfeedTable);

module.exports = router;
