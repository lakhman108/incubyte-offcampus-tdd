const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const { connectDB, clearDB, closeDB } = require('../../config/db');

describe('Auth Endpoints (login)', () => {
  beforeAll(async () => {
    await connectDB();
    await User.init(); // Ensure indexes are created
  });

  afterAll(async () => {
    await clearDB();
    await closeDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should login a registered user successfully', async () => {
      // First register a user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app).post('/api/auth/register').send(userData);

      // Now try to login
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', loginData.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail with missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with incorrect password', async () => {
      // First register a user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app).post('/api/auth/register').send(userData);

      // Try to login with wrong password
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
