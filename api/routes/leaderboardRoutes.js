const express = require('express');
const router = express.Router();
const cache = require('../services/cache');
const {
  getBillfishPachangaTournamentGrandChampion,
  getBillfishPachangaOverallBillfishChampion,
  getBillfishPachangaGrandSlams,
  getBillfishPachangaBillfishDayChampion,
  getBillfishPachangaBillfishSpeciesChampion,
  getBillfishPachangaMeatfishSpeciesChampion,
} = require('../controllers/leaderboardControllers');

const c = cache.middleware(60); // 60-second TTL for all leaderboard endpoints

router.post('/api/:year/get_billfish_pachanga_tournament_grand_champion', c, getBillfishPachangaTournamentGrandChampion);
router.post('/api/:year/get_billfish_pachanga_overall_billfish_champion', c, getBillfishPachangaOverallBillfishChampion);
router.post('/api/:year/get_billfish_pachanga_grand_slams', c, getBillfishPachangaGrandSlams);
router.post('/api/:year/get_billfish_pachanga_billfish_day_champion', c, getBillfishPachangaBillfishDayChampion);
router.post('/api/:year/get_billfish_pachanga_billfish_species_champion', c, getBillfishPachangaBillfishSpeciesChampion);
router.post('/api/:year/get_billfish_pachanga_meatfish_species_champion', c, getBillfishPachangaMeatfishSpeciesChampion);

module.exports = router;
