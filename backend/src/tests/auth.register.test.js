const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const { connectDB, clearDB, closeDB } = require('../config/db');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Post /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        'message',
        'User registered successfully'
      );
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', userData.username);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).not.toHaveProperty('password');
    });
  });
});
