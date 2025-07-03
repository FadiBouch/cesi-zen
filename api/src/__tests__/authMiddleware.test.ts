import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, authorize } from '../middlewares/authMiddleware';
import UserController from '../controllers/userController';
import prisma from '../utils/database';
import { AuthRequest } from '../types/auth';

jest.mock('jsonwebtoken');
jest.mock('../controllers/userController');
jest.mock('../utils/database', () => ({
  role: {
    findFirst: jest.fn()
  }
}));

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockUserController = UserController as jest.Mocked<typeof UserController>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuthMiddleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', () => {
      const mockToken = 'valid-jwt-token';
      const mockDecoded = {
        id: 1,
        username: 'testuser',
        role: { id: 1, name: 'User' }
      };

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };
      
      (mockJwt.verify as jest.Mock).mockImplementation((token, secret, callback: any) => {
        callback(null, mockDecoded);
      });

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.JWT_SECRET,
        expect.any(Function)
      );
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no token provided', () => {
      mockRequest.headers = {};

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accès refusé. Token requis.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is malformed', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accès refusé. Token requis.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 if JWT_SECRET is not configured', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Erreur de configuration du serveur.'
      });
      expect(mockNext).not.toHaveBeenCalled();

      process.env.JWT_SECRET = originalSecret;
    });

    it('should return 403 if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      (mockJwt.verify as jest.Mock).mockImplementation((token, secret, callback: any) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token invalide ou expiré.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should authorize user with correct role', async () => {
      const authorizeMiddleware = authorize(['Admin']);
      
      mockRequest.user = { id: 1, username: 'admin', role: { id: 2, name: 'Admin' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'admin',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        roleId: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockUserController.findById).toHaveBeenCalledWith(1);
      expect(mockPrisma.role.findFirst).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      const authorizeMiddleware = authorize(['Admin']);
      mockRequest.user = undefined;

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Utilisateur non authentifié.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      const authorizeMiddleware = authorize(['Admin']);
      mockRequest.user = { id: 1, username: 'admin', role: { id: 2, name: 'Admin' } as any };
      mockUserController.findById.mockResolvedValue(null);

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is inactive', async () => {
      const authorizeMiddleware = authorize(['Admin']);
      mockRequest.user = { id: 1, username: 'admin', role: { id: 2, name: 'Admin' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'admin',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        roleId: 2,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Ce compte a été désactivé.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 404 if user role not found', async () => {
      const authorizeMiddleware = authorize(['Admin']);
      mockRequest.user = { id: 1, username: 'admin', role: { id: 2, name: 'Admin' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'admin',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        roleId: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue(null);

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Le rôle est introuvable.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', async () => {
      const authorizeMiddleware = authorize(['Admin']);
      mockRequest.user = { id: 1, username: 'user', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'user',
        email: 'user@example.com',
        password: 'hashedPassword',
        firstName: 'Regular',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should work with multiple roles', async () => {
      const authorizeMiddleware = authorize(['Admin', 'User']);
      mockRequest.user = { id: 1, username: 'user', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'user',
        email: 'user@example.com',
        password: 'hashedPassword',
        firstName: 'Regular',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with string role parameter', async () => {
      const authorizeMiddleware = authorize('Admin');
      mockRequest.user = { id: 1, username: 'admin', role: { id: 2, name: 'Admin' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'admin',
        email: 'admin@example.com',
        password: 'hashedPassword',
        firstName: 'Admin',
        lastName: 'User',
        roleId: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access if no roles are specified', async () => {
      const authorizeMiddleware = authorize([]);
      mockRequest.user = { id: 1, username: 'user', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'user',
        email: 'user@example.com',
        password: 'hashedPassword',
        firstName: 'Regular',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await authorizeMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});