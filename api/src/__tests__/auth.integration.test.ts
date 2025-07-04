import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';

describe('Auth Routes Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  describe('Route definitions', () => {
    it('should have POST /register route', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /login route', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
    });

    it('should have GET /profile route', async () => {
      const response = await request(app)
        .get('/auth/profile');
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
    });

    it('should have PUT /profile route', async () => {
      const response = await request(app)
        .put('/auth/profile')
        .send({});
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
    });

    it('should have PUT /change-password route', async () => {
      const response = await request(app)
        .put('/auth/change-password')
        .send({});
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /register-admin route', async () => {
      const response = await request(app)
        .post('/auth/register-admin')
        .send({});
      
      // Should not return 404 (route not found)
      expect(response.status).not.toBe(404);
    });
  });
});