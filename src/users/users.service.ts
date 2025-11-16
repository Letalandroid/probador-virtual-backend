import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto, ChangeUserRoleDto, ChangeUserStatusDto, UpdateProfileDto } from '../models/user.dto';
import { Prisma } from '@prisma/client';
import { genHash } from '../utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: true,
        profile: true,
      },
    });

    // Mapear usuarios para incluir campos en formato camelCase
    return users.map((user) => ({
      ...user,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      role: user.roles[0]?.role || 'client',
    }));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updateData: Prisma.UserUpdateInput = {};

      if (updateUserDto.email) {
        updateData.email = updateUserDto.email;
      }
      if (updateUserDto.full_name) {
        updateData.full_name = updateUserDto.full_name;
      }
      if (updateUserDto.password) {
        updateData.password = await genHash(updateUserDto.password);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          roles: true,
          profile: true,
        },
      });

      return {
        status: 200,
        message: 'Usuario actualizado exitosamente',
        user,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            status: 404,
            message: 'Usuario no encontrado',
          });
        }
        if (error.code === 'P2002') {
          throw new ConflictException({
            status: 409,
            message: 'El email ya está en uso',
          });
        }
      }
      throw new NotFoundException({
        status: 400,
        message: 'Error al actualizar el usuario',
        error: error.message,
      });
    }
  }

  async changeUserRole(id: string, changeRoleDto: ChangeUserRoleDto) {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'Usuario no encontrado',
        });
      }

      // Actualizar o crear el rol
      const existingRole = user.roles[0];
      if (existingRole) {
        await this.prisma.userRoleAssignment.update({
          where: { id: existingRole.id },
          data: { role: changeRoleDto.role as any },
        });
      } else {
        await this.prisma.userRoleAssignment.create({
          data: {
            user_id: id,
            role: changeRoleDto.role as any,
          },
        });
      }

      return {
        status: 200,
        message: `Rol del usuario cambiado a ${changeRoleDto.role} exitosamente`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException({
        status: 400,
        message: 'Error al cambiar el rol del usuario',
        error: error.message,
      });
    }
  }

  async changeUserStatus(id: string, changeStatusDto: ChangeUserStatusDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { 
          // Nota: En el schema actual no hay campo is_active, 
          // pero podemos usar el campo updated_at para marcar cambios
          updated_at: new Date(),
        },
        include: {
          roles: true,
          profile: true,
        },
      });

      return {
        status: 200,
        message: `Estado del usuario actualizado exitosamente`,
        user,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            status: 404,
            message: 'Usuario no encontrado',
          });
        }
      }
      throw new NotFoundException({
        status: 400,
        message: 'Error al actualizar el estado del usuario',
        error: error.message,
      });
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const profile = await this.prisma.profile.upsert({
        where: { user_id: userId },
        update: updateProfileDto,
        create: {
          user_id: userId,
          ...updateProfileDto,
        },
      });

      return {
        status: 200,
        message: 'Perfil actualizado exitosamente',
        profile,
      };
    } catch (error) {
      throw new NotFoundException({
        status: 400,
        message: 'Error al actualizar el perfil',
        error: error.message,
      });
    }
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException({
        status: 404,
        message: 'Perfil no encontrado',
      });
    }

    return profile;
  }

  async deleteUser(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return {
        status: 200,
        message: 'Usuario eliminado exitosamente',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            status: 404,
            message: 'Usuario no encontrado',
          });
        }
      }
      throw new NotFoundException({
        status: 400,
        message: 'Error al eliminar el usuario',
        error: error.message,
      });
    }
  }
}
