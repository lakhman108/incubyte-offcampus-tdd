const express = require('express');
const { createSweet } = require('../controllers/sweetController');

const router = express.Router();

router.post('/', createSweet);

module.exports = router;
