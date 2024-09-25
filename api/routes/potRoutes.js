const express = require('express');
const router = express.Router();
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

router.post('/api/:year/get_all_pot_data', getAllPotData);
router.post('/api/:year/get_total_pot_size_data', getTotalPotSizeData);
router.post('/api/:year/get_billfish_pachanga_tournament_grand_champion_pot_standings', getBillfishPachangaTournamentGrandChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_overall_billfish_champion_pot_standings', getBillfishPachangaOverallBillfishChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_grand_slams_pot_standings', getBillfishPachangaGrandSlamsPotStandings);
router.post('/api/:year/get_billfish_pachanga_billfish_day_champion_pot_standings', getBillfishPachangaBillfishDayChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_billfish_species_champion_pot_standings', getBillfishPachangaBillfishSpeciesChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_meatfish_species_champion_pot_standings', getBillfishPachangaMeatfishSpeciesChampionPotStandings);
router.post('/api/:year/get_billfish_pachanga_overall_billfish_non_sonar_pot_standings', getBillfishPachangaOverallBillfishNonSonarPotStandings);
router.post('/api/:year/get_billfish_pachanga_captain_and_mate_pot_standings', getBillfishPachangaCaptainAndMatePotStandings);

module.exports = router;

