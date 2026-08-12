const express = require('express');
const router = express.Router();
const {
  getContacts,
  addContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All contact routes require authentication

router.route('/')
  .get(getContacts)
  .post(addContact);

router.route('/:id')
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
