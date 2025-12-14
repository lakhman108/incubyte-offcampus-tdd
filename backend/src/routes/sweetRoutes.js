const express = require('express');
const {
  createSweet,
  getAllSweets,
  searchSweets
} = require('../controllers/sweetController');
const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

router.get('/search', authenticateCustomer, searchSweets);
router.get('/', authenticateCustomer, getAllSweets);
router.post('/', authenticateCustomer, createSweet);

module.exports = router;
