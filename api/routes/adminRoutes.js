const express = require('express');
const bodyParser = require("body-parser");

module.exports = ({ redisClient }) => {
  const router = express.Router();
  const {
    adminGetDatabaseCount,
    adminGetDatabaseList,
    adminAddTeam,
    adminEditTeam,
    adminDeleteTeam,
    adminGetCatches,
    adminAddCatch,
    adminEditCatch,
    adminDeleteCatch,
    adminAddAnnouncement,
    adminEditAnnouncement,
    adminDeleteAnnouncement,
    adminGetTotalCatchCount,
    adminGetTotalCatchCountBySpecies,
    adminGetRegisteredTeamDataForReport,
    upload
  } = require('../controllers/adminControllers')({ redisClient });

  router.post('/api/admin_get_database_count', adminGetDatabaseCount);
  router.post('/api/admin_get_database_list', adminGetDatabaseList);
  router.post('/api/admin_add_team', upload.fields([
    { name: 'requiredImageUploads', maxCount: 10 },
    { name: 'imageUploads', maxCount: 10 }
  ]), adminAddTeam);
  router.post('/api/admin_edit_team', upload.fields([
    { name: 'newImages', maxCount: 20 }
  ]), adminEditTeam);  
  router.post('/api/admin_delete_team', adminDeleteTeam);
  router.post('/api/admin_get_catches', adminGetCatches);
  router.post('/api/admin_add_catch', upload.any(), adminAddCatch);
  router.post('/api/admin_edit_catch', upload.any(), adminEditCatch);
  router.post('/api/admin_delete_catch', adminDeleteCatch);
  router.post('/api/admin_add_announcement', adminAddAnnouncement);
  router.post('/api/admin_edit_announcement', adminEditAnnouncement);
  router.post('/api/admin_delete_announcement', adminDeleteAnnouncement);
  router.post('/api/admin_get_total_catch_count', adminGetTotalCatchCount);
  router.post('/api/admin_get_total_catch_count_by_species', adminGetTotalCatchCountBySpecies);
  router.post('/api/admin_get_registered_team_data_for_report', adminGetRegisteredTeamDataForReport);

  return router;
};

