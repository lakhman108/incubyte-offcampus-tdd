const express = require('express');
const { createSweet, getAllSweets } = require('../controllers/sweetController');
const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateCustomer, getAllSweets);
router.post('/', authenticateCustomer, createSweet);

module.exports = router;
