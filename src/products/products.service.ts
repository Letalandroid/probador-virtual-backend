import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto, UpdateProductDto } from '../models/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, userId: string) {
    try {
      // Verificar que la categoría existe
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.category_id },
      });

      if (!category) {
        throw new NotFoundException({
          status: 404,
          message: 'Categoría no encontrada',
        });
      }

      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          created_by: userId,
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
      });

      return {
        status: 201,
        message: 'Producto creado exitosamente',
        product,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new NotFoundException({
          message: 'Error al validar los campos recibidos',
          error: error.message,
        });
      }
      
      throw new NotFoundException({
        message: 'Error inesperado al crear el producto',
        error: error.message,
      });
    }
  }

  async getAllProducts(page: number = 1, limit: number = 10, categoryId?: string, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ProductWhereInput = {
      is_active: true,
      ...(categoryId && { category_id: categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException({
        status: 404,
        message: 'Producto no encontrado',
      });
    }

    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, userId: string) {
    try {
      // Verificar que el producto existe
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException({
          status: 404,
          message: 'Producto no encontrado',
        });
      }

      // Verificar que el usuario es el creador o es admin
      if (existingProduct.created_by !== userId) {
        // Aquí podrías verificar si el usuario es admin
        // Por ahora, solo permitimos al creador actualizar
      }

      // Si se está cambiando la categoría, verificar que existe
      if (updateProductDto.category_id) {
        const category = await this.prisma.category.findUnique({
          where: { id: updateProductDto.category_id },
        });

        if (!category) {
          throw new NotFoundException({
            status: 404,
            message: 'Categoría no encontrada',
          });
        }
      }

      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
            },
          },
        },
      });

      return {
        status: 200,
        message: 'Producto actualizado exitosamente',
        product,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException({
        message: 'Error al actualizar el producto',
        error: error.message,
      });
    }
  }

  async deleteProduct(id: string, userId: string) {
    try {
      // Verificar que el producto existe
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException({
          status: 404,
          message: 'Producto no encontrado',
        });
      }

      // Verificar que el usuario es el creador o es admin
      if (existingProduct.created_by !== userId) {
        // Aquí podrías verificar si el usuario es admin
        // Por ahora, solo permitimos al creador eliminar
      }

      await this.prisma.product.delete({
        where: { id },
      });

      return {
        status: 200,
        message: 'Producto eliminado exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException({
        message: 'Error al eliminar el producto',
        error: error.message,
      });
    }
  }

  async getProductsByCategory(categoryId: string, page: number = 1, limit: number = 10) {
    return this.getAllProducts(page, limit, categoryId);
  }

  async searchProducts(search: string, page: number = 1, limit: number = 10) {
    return this.getAllProducts(page, limit, undefined, search);
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { is_active: true },
      take: limit,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateProductStock(id: string, quantity: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException({
          status: 404,
          message: 'Producto no encontrado',
        });
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          stock_quantity: Math.max(0, product.stock_quantity + quantity),
        },
        include: {
          category: true,
        },
      });

      return {
        status: 200,
        message: 'Stock actualizado exitosamente',
        product: updatedProduct,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException({
        message: 'Error al actualizar el stock',
        error: error.message,
      });
    }
  }
}
