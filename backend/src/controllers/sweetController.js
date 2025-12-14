const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const { buildSearchQuery } = require('../utils/querybuilder');
const { validateSweet, validateSweetUpdate } = require('../utils/validators');

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

const updateSweets = async (req, res) => {
  try {
    const sweetId = req.params.id;
    const { name, category, price, quantity } = req.body;

    const existingSweet = await Sweet.findById(sweetId);

    if (existingSweet === null) {
      return res.status(404).send({
        error: 'sweet does not exist'
      });
    }

    const updateValidationError = validateSweetUpdate(price, quantity);
    if (updateValidationError !== null) {
      return res.status(400).send({
        error: updateValidationError
      });
    }

    existingSweet.name = name || existingSweet.name;
    existingSweet.category = category || existingSweet.category;
    existingSweet.price = price || existingSweet.price;
    existingSweet.quantity = quantity || existingSweet.quantity;

    await existingSweet.save();

    return res.status(200).json({
      message: 'Sweet updated successfully',
      data: existingSweet
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid sweet ID' });
    }

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    return res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid sweet ID' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity === 0) {
      return res.status(400).json({ error: 'Sweet is out of stock' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({
        error: `Insufficient stock. Only ${sweet.quantity} available`
      });
    }

    sweet.quantity -= quantity;
    await sweet.save();

    return res.json({
      message: 'Purchase successful',
      sweet
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Server error', message: error.message });
  }
};

module.exports = {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweets,
  deleteSweet,
  purchaseSweet
};
