import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../models/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      // Verificar si la categoría ya existe
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException({
          status: 409,
          message: 'La categoría con este nombre ya existe',
        });
      }

      const category = await this.prisma.category.create({
        data: createCategoryDto,
      });

      return {
        status: 201,
        message: 'Categoría creada exitosamente',
        category,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new NotFoundException({
          message: 'Error al validar los campos recibidos',
          error: error.message,
        });
      }
      
      throw new NotFoundException({
        message: 'Error inesperado al crear la categoría',
        error: error.message,
      });
    }
  }

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    
    // Mapear campos a formato camelCase para el frontend
    return categories.map((cat) => ({
      ...cat,
      isActive: cat.is_active,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock_quantity: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException({
        status: 404,
        message: 'Categoría no encontrada',
      });
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      // Verificar si la categoría existe
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException({
          status: 404,
          message: 'Categoría no encontrada',
        });
      }

      // Si se está cambiando el nombre, verificar que no exista otra categoría con ese nombre
      if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
        const nameExists = await this.prisma.category.findUnique({
          where: { name: updateCategoryDto.name },
        });

        if (nameExists) {
          throw new ConflictException({
            status: 409,
            message: 'Ya existe una categoría con este nombre',
          });
        }
      }

      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return {
        status: 200,
        message: 'Categoría actualizada exitosamente',
        category,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new NotFoundException({
        message: 'Error al actualizar la categoría',
        error: error.message,
      });
    }
  }

  async deleteCategory(id: string) {
    try {
      // Verificar si la categoría existe
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!existingCategory) {
        throw new NotFoundException({
          status: 404,
          message: 'Categoría no encontrada',
        });
      }

      // Verificar si tiene productos asociados
      if (existingCategory.products.length > 0) {
        throw new ConflictException({
          status: 409,
          message: 'No se puede eliminar la categoría porque tiene productos asociados',
        });
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return {
        status: 200,
        message: 'Categoría eliminada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      throw new NotFoundException({
        message: 'Error al eliminar la categoría',
        error: error.message,
      });
    }
  }

  async getActiveCategories() {
    const categories = await this.prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    
    // Mapear campos a formato camelCase para el frontend
    return categories.map((cat) => ({
      ...cat,
      isActive: cat.is_active,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));
  }
}
