const express = require('express');
const { createSweet } = require('../controllers/sweetController');
const { authenticateCustomer } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateCustomer, createSweet);

module.exports = router;
