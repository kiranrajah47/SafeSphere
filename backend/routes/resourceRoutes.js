const express = require('express');
const router = express.Router();
const { getNearbyResources, getHotlines } = require('../controllers/resourceController');

router.get('/nearby', getNearbyResources);
router.get('/hotlines', getHotlines);

module.exports = router;
