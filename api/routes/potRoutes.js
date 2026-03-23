const express = require('express');
const router = express.Router();
const cache = require('../services/cache');
const {
  getAllPotData,
  getTotalPotSizeData,
  getBillfishPachangaTournamentGrandChampionPotStandings,
  getBillfishPachangaOverallBillfishChampionPotStandings,
  getBillfishPachangaGrandSlamsPotStandings,
  getBillfishPachangaBillfishDayChampionPotStandings,
  getBillfishPachangaBillfishSpeciesChampionPotStandings,
  getBillfishPachangaMeatfishSpeciesChampionPotStandings,
  getBillfishPachangaOverallBillfishNonSonarPotStandings,
  getBillfishPachangaCaptainAndMatePotStandings,
} = require('../controllers/potControllers');

const c = cache.middleware(60); // 60-second TTL for all pot endpoints

router.post('/api/:year/get_all_pot_data', c, getAllPotData);
router.post('/api/:year/get_total_pot_size_data', c, getTotalPotSizeData);
router.post('/api/:year/get_billfish_pachanga_tournament_grand_champion_pot_standings', c, getBillfishPachangaTournamentGrandChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_overall_billfish_champion_pot_standings', c, getBillfishPachangaOverallBillfishChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_grand_slams_pot_standings', c, getBillfishPachangaGrandSlamsPotStandings);
router.post('/api/:year/get_billfish_pachanga_billfish_day_champion_pot_standings', c, getBillfishPachangaBillfishDayChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_billfish_species_champion_pot_standings', c, getBillfishPachangaBillfishSpeciesChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_meatfish_species_champion_pot_standings', c, getBillfishPachangaMeatfishSpeciesChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_overall_billfish_non_sonar_pot_standings', c, getBillfishPachangaOverallBillfishNonSonarPotStandings);
router.post('/api/:year/get_billfish_pachanga_captain_and_mate_pot_standings', c, getBillfishPachangaCaptainAndMatePotStandings);

module.exports = router;
