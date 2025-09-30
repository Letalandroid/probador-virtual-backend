import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { comparePassword, genHash } from '../utils/bcrypt';
import { JWTConfig } from '../utils/jwt';
import { CreateUserDto, LoginDto } from '../models/user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly jwtConfig: JWTConfig,
  ) {}

  async register(data: CreateUserDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException({
          status: 409,
          message: 'El usuario con este email ya existe',
        });
      }

      // Hash de la contraseña
      const hashedPassword = await genHash(data.password);

      // Crear usuario
      const userData = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          full_name: data.full_name,
        },
      });

      // Asignar rol por defecto si no se especifica
      const role = data.role || 'client';
      await this.prisma.userRoleAssignment.create({
        data: {
          user_id: userData.id,
          role: role as any,
        },
      });

      // Crear perfil básico
      await this.prisma.profile.create({
        data: {
          user_id: userData.id,
          full_name: data.full_name,
        },
      });

      return {
        status: 201,
        message: 'Usuario creado exitosamente',
        user: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: role,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException({
          message: 'Error creando usuario',
          error: error.meta,
        });
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new NotFoundException({
          message: 'Error al validar los campos recibidos',
          error: error.message,
        });
      } else {
        throw new NotFoundException({
          message: 'Error inesperado al crear usuario',
          error: error.message,
        });
      }
    }
  }

  async login(user: LoginDto) {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { email: user.email },
        include: {
          roles: true,
          profile: true,
        },
      });

      if (!foundUser) {
        throw new UnauthorizedException({
          status: 401,
          message: 'Credenciales inválidas',
        });
      }

      if (!foundUser.password) {
        throw new UnauthorizedException({
          status: 401,
          message: 'Usuario no tiene contraseña configurada',
        });
      }

      const isPasswordValid = await comparePassword(user.password, foundUser.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException({
          status: 401,
          message: 'Credenciales inválidas',
        });
      }

      // Obtener el rol del usuario
      const userRole = foundUser.roles[0]?.role || 'client';

      const payload = {
        userId: foundUser.id,
        email: foundUser.email,
        full_name: foundUser.full_name,
        role: userRole,
      };

      const token = await this.jwtService.signAsync(
        payload,
        this.jwtConfig.getConfig(),
      );

      return {
        status: 200,
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          full_name: foundUser.full_name,
          role: userRole,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException({
        status: 401,
        message: 'Error en el inicio de sesión',
        error: error.message,
      });
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async getCurrentUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
          profile: true,
        },
      });

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'Usuario no encontrado',
        });
      }

      // Obtener el rol del usuario
      const userRole = user.roles[0]?.role || 'client';

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: userRole,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException({
        status: 404,
        message: 'Error al obtener información del usuario',
        error: error.message,
      });
    }
  }
}
