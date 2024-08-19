const express = require('express');
const router = express.Router();
const {
  adminGetDatabaseCount,
  adminGetDatabaseList,
  adminAddTeam,
  adminUpdateTeam,
  adminDeleteTeam,
  adminGetCatches,
  adminAddCatch,
  adminUpdateCatch,
  adminDeleteCatch
} = require('../controllers/adminControllers');

router.post('/api/admin_get_database_count', adminGetDatabaseCount);
router.post('/api/admin_get_database_list', adminGetDatabaseList);
router.post('/api/admin_add_team', adminAddTeam);
router.post('/api/admin_update_team', adminUpdateTeam);
router.post('/api/admin_delete_team', adminDeleteTeam);
router.post('/api/admin_get_catches', adminGetCatches);
router.post('/api/admin_add_catch', adminAddCatch);
router.post('/api/admin_update_catch', adminUpdateCatch);
router.post('/api/admin_delete_catch', adminDeleteCatch);

module.exports = router


