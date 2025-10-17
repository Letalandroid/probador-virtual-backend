import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

// Mock de JwtService
const mockJwtService = {
  verify: jest.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn(),
        getResponse: jest.fn(),
        getNext: jest.fn(),
        getType: jest.fn(),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      } as any;
    });

    it('should return true when token is valid', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'client',
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      mockJwtService.verify.mockReturnValue(mockPayload);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when no token provided', () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token format is invalid', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).toHaveBeenCalledWith('invalid-token');
    });

    it('should throw UnauthorizedException when token is expired', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer expired-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).toHaveBeenCalledWith('expired-token');
    });

    it('should handle different authorization header formats', () => {
      // Test case: Bearer token with extra spaces
      const mockRequest = {
        headers: {
          authorization: '  Bearer   valid-token  ',
        },
      };

      const mockPayload = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'client',
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      mockJwtService.verify.mockReturnValue(mockPayload);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when authorization header is missing', () => {
      // Arrange
      const mockRequest = {
        headers: {
          // No authorization header
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is empty', () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: '',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });
  });
});
