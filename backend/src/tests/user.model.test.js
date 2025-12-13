const mongoose = require('mongoose');
const User = require('../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test Database
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetshop_test';
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create a valid user with required fields', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should fail validation without required fields', async () => {
    const user = new User({});
    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('should have default role as customer', async () => {
    const userData = {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.role).toBe('customer');
  });

it('should hash password before saving', async () => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const user = new User(userData);
  const savedUser = await user.save();

  expect(savedUser.password).not.toBe(userData.password);
  expect(savedUser.password.length).toBeGreaterThan(userData.password.length);
});

it('should compare password correctly', async () => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const user = new User(userData);
  const savedUser = await user.save();

  const isMatch = await savedUser.comparePassword('password123');
  const isNotMatch = await savedUser.comparePassword('wrongpassword');

  expect(isMatch).toBe(true);
  expect(isNotMatch).toBe(false);
});

});
