const express = require('express');
const router = express.Router();
const { getNearbyResources, getHotlines } = require('../controllers/resourceController');
const { getGuides, getGuideById, toggleBookmark } = require('../controllers/guideController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/nearby', getNearbyResources);
router.get('/hotlines', getHotlines);

// Safety & Health Guides
router.get('/guides', (req, res, next) => {
  // Optional auth header inspection for bookmark resolution
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => getGuides(req, res, next));
  }
  getGuides(req, res, next);
});

router.get('/guides/:id', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => getGuideById(req, res, next));
  }
  getGuideById(req, res, next);
});

router.post('/guides/:id/bookmark', protect, toggleBookmark);

module.exports = router;
