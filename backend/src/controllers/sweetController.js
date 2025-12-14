const Sweet = require('../models/Sweet');
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

module.exports = { createSweet };
