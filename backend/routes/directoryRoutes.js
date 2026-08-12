const express = require('express');
const router = express.Router();
const {
  getDirectoryEntries,
  getDirectoryEntryById,
  createDirectoryEntry,
  updateDirectoryEntry,
  deleteDirectoryEntry
} = require('../controllers/directoryController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', getDirectoryEntries);
router.get('/:id', getDirectoryEntryById);

router.post('/', protect, adminOnly, createDirectoryEntry);
router.put('/:id', protect, adminOnly, updateDirectoryEntry);
router.delete('/:id', protect, adminOnly, deleteDirectoryEntry);

module.exports = router;
