const Sweet = require('../models/Sweet');
const { buildSearchQuery } = require('../utils/querybuilder');
const { validateSweet } = require('../utils/validators');

const createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    const validationError = validateSweet(name, category, price, quantity);
    if (validationError !== null) {
      return res.status(400).send({
        error: validationError
      });
    }
    const sweet = await Sweet.create({ name, category, price, quantity });
    return res.status(201).json(sweet);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Server error', message: error.message });
  }
};

const getAllSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find({});
    return res.status(200).json(sweets);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const query = buildSearchQuery(name, category, minPrice, maxPrice);

    const sweets = await Sweet.find(query);
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createSweet, getAllSweets, searchSweets };
