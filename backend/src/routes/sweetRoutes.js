const express = require('express');
const {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweets,
  deleteSweet,
  purchaseSweet,
  restockSweet
} = require('../controllers/sweetController');
const {
  authenticateCustomer,
  authenticateAdmin
} = require('../middleware/auth');

const router = express.Router();

router.get('/search', authenticateCustomer, searchSweets);
router.put('/:id', authenticateCustomer, updateSweets);
router.delete('/:id', authenticateAdmin, deleteSweet);
router.get('/', authenticateCustomer, getAllSweets);
router.post('/:id/purchase', authenticateCustomer, purchaseSweet);
router.post('/:id/restock', authenticateAdmin, restockSweet);
router.post('/', authenticateCustomer, createSweet);

module.exports = router;
