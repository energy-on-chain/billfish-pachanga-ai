const express = require('express');
const router = express.Router();
const {
  getTypeCountDataForNewsfeedTable,
  getSpeciesCountDataForNewsfeedTable,
  getTeamCountDataForNewsfeedTable,
  getDateCountDataForNewsfeedTable,
  getEventDataForNewsfeedTable,
} = require('../controllers/newsfeedControllers');

router.post('/api/:year/get_type_count_data_for_newsfeed_table', getTypeCountDataForNewsfeedTable);
router.post('/api/:year/get_species_count_data_for_newsfeed_table', getSpeciesCountDataForNewsfeedTable);
router.post('/api/:year/get_team_count_data_for_newsfeed_table', getTeamCountDataForNewsfeedTable);
router.post('/api/:year/get_date_count_data_for_newsfeed_table', getDateCountDataForNewsfeedTable);
router.post('/api/:year/get_event_data_for_newsfeed_table', getEventDataForNewsfeedTable);

module.exports = router;

