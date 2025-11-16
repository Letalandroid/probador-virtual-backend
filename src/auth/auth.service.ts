import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { comparePassword, genHash } from '../utils/bcrypt';
import { CreateUserDto, LoginDto } from '../models/user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    try {
      // Hash de la contraseña
      const hashedPassword = await genHash(data.password);
      const role = data.role || 'client';

      // Usar transacción para crear usuario, rol y perfil en una sola operación atómica
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear usuario (si el email existe, Prisma lanzará error P2002)
        const userData = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            full_name: data.full_name,
          },
        });

        // Crear rol y perfil en paralelo dentro de la transacción
        const [roleAssignment] = await Promise.all([
          tx.userRoleAssignment.create({
            data: {
              user_id: userData.id,
              role: role as any,
            },
          }),
          tx.profile.create({
            data: {
              user_id: userData.id,
              full_name: data.full_name,
            },
          }),
        ]);

        return { userData, role };
      });

      // Generar token JWT para auto-login después del registro
      const payload = {
        userId: result.userData.id,
        email: result.userData.email,
        full_name: result.userData.full_name,
        role: result.role,
      };

      const token = await this.jwtService.signAsync(payload);

      return {
        status: 201,
        message: 'Usuario creado exitosamente',
        token,
        user: {
          id: result.userData.id,
          email: result.userData.email,
          full_name: result.userData.full_name,
          role: result.role,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            status: 409,
            message: 'El usuario con este email ya existe',
          });
        }
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

      const token = await this.jwtService.signAsync(payload);

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
