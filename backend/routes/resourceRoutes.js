const express = require('express');
const router = express.Router();
const { getHotlines, getNearbyResources } = require('../controllers/resourceController');

router.get('/hotlines', getHotlines);
router.get('/nearby', getNearbyResources);

module.exports = router;
