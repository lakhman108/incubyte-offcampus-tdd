const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');

describe('Sweet Model', () => {
  beforeAll(async () => {
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetshop_test';
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Sweet.deleteMany({});
  });

  it('should create a valid sweet with required fields', async () => {
    const sweetData = {
      name: 'Chocolate Bar',
      category: 'chocolate',
      price: 2.99,
      quantity: 50,
      description: 'Delicious milk chocolate bar'
    };

    const sweet = new Sweet(sweetData);
    const savedSweet = await sweet.save();

    expect(savedSweet._id).toBeDefined();
    expect(savedSweet.name).toBe(sweetData.name);
    expect(savedSweet.category).toBe(sweetData.category);
    expect(savedSweet.price).toBe(sweetData.price);
    expect(savedSweet.quantity).toBe(sweetData.quantity);
    expect(savedSweet.createdAt).toBeDefined();
  });

  it('should fail validation without required fields', async () => {
    const sweet = new Sweet({});

    let error;
    try {
      await sweet.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
  });

  it('should validate price is positive number', async () => {
    const sweetData = {
      name: 'Test Sweet',
      category: 'candy',
      price: -1.99,
      quantity: 10
    };

    const sweet = new Sweet(sweetData);

    let error;
    try {
      await sweet.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it('should validate quantity is non-negative integer', async () => {
    const sweetData = {
      name: 'Test Sweet',
      category: 'candy',
      price: 1.99,
      quantity: -5
    };

    const sweet = new Sweet(sweetData);

    let error;
    try {
      await sweet.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
  });
});
