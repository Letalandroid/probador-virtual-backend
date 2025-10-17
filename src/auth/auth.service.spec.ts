import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JWTConfig } from '../utils/jwt';
import { CreateUserDto, LoginDto } from '../models/user.dto';
import { Prisma } from '@prisma/client';

// Mock de PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  userRoleAssignment: {
    create: jest.fn(),
  },
  profile: {
    create: jest.fn(),
  },
};

// Mock de JwtService
const mockJwtService = {
  signAsync: jest.fn(),
};

// Mock de JWTConfig
const mockJWTConfig = {
  getConfig: jest.fn().mockReturnValue({
    secret: 'test-secret',
    expiresIn: '1h',
  }),
};

// Mock de bcrypt
jest.mock('../utils/bcrypt', () => ({
  genHash: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: JWTConfig,
          useValue: mockJWTConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'client',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'hashed-password',
      });
      mockPrismaService.userRoleAssignment.create.mockResolvedValue({});
      mockPrismaService.profile.create.mockResolvedValue({});

      // Act
      const result = await service.register(createUserDto);

      // Assert
      expect(result).toEqual({
        status: 201,
        message: 'Usuario creado exitosamente',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'client',
        },
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password',
          full_name: 'Test User',
        },
      });
      expect(mockPrismaService.userRoleAssignment.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-id',
          role: 'client',
        },
      });
      expect(mockPrismaService.profile.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-id',
          full_name: 'Test User',
        },
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
      });

      // Act & Assert
      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should handle Prisma validation errors', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientValidationError('Validation error', {
        clientVersion: '5.0.0',
      });
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.register(createUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should assign default role when not provided', async () => {
      // Arrange
      const createUserDtoWithoutRole = { ...createUserDto };
      delete createUserDtoWithoutRole.role;
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password: 'hashed-password',
      });
      mockPrismaService.userRoleAssignment.create.mockResolvedValue({});
      mockPrismaService.profile.create.mockResolvedValue({});

      // Act
      const result = await service.register(createUserDtoWithoutRole);

      // Assert
      expect(result.user.role).toBe('client');
      expect(mockPrismaService.userRoleAssignment.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-id',
          role: 'client',
        },
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        full_name: 'Test User',
        roles: [{ role: 'client' }],
        profile: { full_name: 'Test User' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        status: 200,
        message: 'Inicio de sesión exitoso',
        token: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'client',
        },
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          userId: 'user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'client',
        },
        { secret: 'test-secret', expiresIn: '1h' }
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        full_name: 'Test User',
        roles: [{ role: 'client' }],
        profile: { full_name: 'Test User' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      
      // Mock comparePassword to return false
      const { comparePassword } = require('../utils/bcrypt');
      comparePassword.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user has no password', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: null,
        full_name: 'Test User',
        roles: [{ role: 'client' }],
        profile: { full_name: 'Test User' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        roles: [{ role: 'client' }],
        profile: { full_name: 'Test User' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser('user-id');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: {
          roles: true,
          profile: true,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser('non-existent-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: new Date(),
        updated_at: new Date(),
        roles: [{ role: 'client' }],
        profile: { full_name: 'Test User' },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getCurrentUser('user-id');

      // Assert
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'client',
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentUser('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getCurrentUser('user-id')).rejects.toThrow(NotFoundException);
    });
  });
});