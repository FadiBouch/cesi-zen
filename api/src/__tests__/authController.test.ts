import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login, getProfile, updateProfile, changePassword, createAdmin } from '../controllers/authController';
import UserController from '../controllers/userController';
import prisma from '../utils/database';
import { AuthRequest } from '../types/auth';

jest.mock('../controllers/userController');
jest.mock('../utils/database', () => ({
  role: {
    findFirst: jest.fn()
  }
}));
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUserController = UserController as jest.Mocked<typeof UserController>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockAuthRequest: Partial<AuthRequest>;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockAuthRequest = {
      body: {},
      user: { id: 1, username: 'testuser', role: { id: 1, name: 'User' } as any }
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'User'
      };

      mockRequest.body = registerData;
      mockUserController.exists.mockResolvedValue(false);
      mockUserController.create.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockUserController.exists).toHaveBeenCalledWith('testuser', 'test@example.com');
      expect(mockUserController.create).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Utilisateur créé avec succès',
        user: expect.objectContaining({
          id: 1,
          userName: 'testuser',
          email: 'test@example.com'
        })
      });
    });

    it('should return 400 if user already exists', async () => {
      mockRequest.body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      mockUserController.exists.mockResolvedValue(true);

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cet utilisateur ou cette adresse email existe déjà.'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      mockRequest.body = loginData;
      mockUserController.findByUsername.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockPrisma.role.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockUserController.findByUsername).toHaveBeenCalledWith('testuser');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockJwt.sign).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: 'mock-jwt-token',
        user: expect.objectContaining({
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        })
      });
    });

    it('should return 400 if user not found', async () => {
      mockRequest.body = {
        username: 'nonexistent',
        password: 'password123'
      };

      mockUserController.findByUsername.mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Nom d\'utilisateur ou mot de passe incorrect.'
      });
    });

    it('should return 403 if user is inactive', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123'
      };

      mockUserController.findByUsername.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Ce compte a été désactivé.'
      });
    });

    it('should return 400 if password is invalid', async () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      mockUserController.findByUsername.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Nom d\'utilisateur ou mot de passe incorrect.'
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      mockAuthRequest.user = { id: 1, username: 'testuser', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await getProfile(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockUserController.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          userName: 'testuser',
          email: 'test@example.com'
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      mockAuthRequest.user = undefined;

      await getProfile(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Utilisateur non authentifié.'
      });
    });

    it('should return 404 if user not found', async () => {
      mockAuthRequest.user = { id: 1, username: 'testuser', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue(null);

      await getProfile(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé.'
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };

      mockAuthRequest.body = changePasswordData;
      mockAuthRequest.user = { id: 1, username: 'testuser', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedOldPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockBcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserController.updatePassword.mockResolvedValue(undefined as any);

      await changePassword(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockBcrypt.compare).toHaveBeenCalledWith('oldpassword', 'hashedOldPassword');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword123', 'salt');
      expect(mockUserController.updatePassword).toHaveBeenCalledWith(1, 'hashedNewPassword');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Mot de passe modifié avec succès'
      });
    });

    it('should return 400 if current password is incorrect', async () => {
      mockAuthRequest.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };
      mockAuthRequest.user = { id: 1, username: 'testuser', role: { id: 1, name: 'User' } as any };
      mockUserController.findById.mockResolvedValue({
        id: 1,
        userName: 'testuser',
        email: 'test@example.com',
        password: 'hashedOldPassword',
        firstName: 'Test',
        lastName: 'User',
        roleId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await changePassword(mockAuthRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Le mot de passe actuel est incorrect.'
      });
    });
  });
});