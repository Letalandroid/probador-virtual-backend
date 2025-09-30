import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { UserRoleAssignmentService } from '../users/user-role-assignment.service';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    full_name: 'Test User',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockUsersService = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ProfilesService,
          useValue: {},
        },
        {
          provide: UserRoleAssignmentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should return null when user is not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockedBcrypt.compare.mockResolvedValue(false as never);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginDto);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });

  describe('register', () => {
    it('should create user and return access token', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
      };

      const hashedPassword = 'hashedPassword';
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUsersService.createUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
        },
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });
  });
});

