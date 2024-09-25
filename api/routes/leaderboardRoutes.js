const express = require('express');
const router = express.Router();
const {
  getBillfishPachangaTournamentGrandChampion,
  getBillfishPachangaOverallBillfishChampion,
  getBillfishPachangaGrandSlams,
  getBillfishPachangaBillfishDayChampion,
  getBillfishPachangaBillfishSpeciesChampion,
  getBillfishPachangaMeatfishSpeciesChampion,
} = require('../controllers/leaderboardControllers');

router.post('/api/:year/get_billfish_pachanga_tournament_grand_champion', getBillfishPachangaTournamentGrandChampion);
router.post('/api/:year/get_billfish_pachanga_overall_billfish_champion', getBillfishPachangaOverallBillfishChampion);
router.post('/api/:year/get_billfish_pachanga_grand_slams', getBillfishPachangaGrandSlams);
router.post('/api/:year/get_billfish_pachanga_billfish_day_champion', getBillfishPachangaBillfishDayChampion);
router.post('/api/:year/get_billfish_pachanga_billfish_species_champion', getBillfishPachangaBillfishSpeciesChampion);
router.post('/api/:year/get_billfish_pachanga_meatfish_species_champion', getBillfishPachangaMeatfishSpeciesChampion);

module.exports = router;

