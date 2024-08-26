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
  router.post('/api/admin_add_catch', adminAddCatch);
  router.post('/api/admin_edit_catch', adminEditCatch);
  router.post('/api/admin_delete_catch', adminDeleteCatch);
  router.post('/api/admin_get_registered_team_data_for_report', adminGetRegisteredTeamDataForReport);

  return router;
};

