import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto, UpdateProductDto } from '../models/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, userId: string) {
    try {
      // Crear producto directamente, Prisma validará la foreign key de categoría
      // Si la categoría no existe, lanzará error P2003
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
      }).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            throw new NotFoundException({
              status: 404,
              message: 'Categoría no encontrada',
            });
          }
          if (error.code === 'P2002') {
            throw new ConflictException({
              status: 409,
              message: 'Ya existe un producto con estos datos',
            });
          }
        }
        throw error;
      });

      return {
        status: 201,
        message: 'Producto creado exitosamente',
        product,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
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
      // RF02: El catálogo digital no incluirá ropa para niños
      gender: { not: 'kids' },
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
      // Si se está cambiando la categoría, verificar que existe primero
      if (updateProductDto.category_id) {
        const category = await this.prisma.category.findUnique({
          where: { id: updateProductDto.category_id },
          select: { id: true },
        });

        if (!category) {
          throw new NotFoundException({
            status: 404,
            message: 'Categoría no encontrada',
          });
        }
      }

      // Actualizar directamente (evita query redundante de verificación de producto)
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
      }).catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException({
              status: 404,
              message: 'Producto no encontrado',
            });
          }
          if (error.code === 'P2003') {
            throw new NotFoundException({
              status: 404,
              message: 'Categoría no encontrada',
            });
          }
        }
        throw error;
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
      // Eliminar directamente, Prisma lanzará error si no existe (evita query redundante)
      await this.prisma.product.delete({
        where: { id },
      });

      return {
        status: 200,
        message: 'Producto eliminado exitosamente',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            status: 404,
            message: 'Producto no encontrado',
          });
        }
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
      where: { 
        is_active: true,
        // RF02: El catálogo digital no incluirá ropa para niños
        gender: { not: 'kids' },
      },
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
      // Usar update con incremento directo en la base de datos (más eficiente)
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          stock_quantity: {
            increment: quantity,
          },
        },
        include: {
          category: true,
        },
      }).catch(async (error) => {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            status: 404,
            message: 'Producto no encontrado',
          });
        }
        throw error;
      });

      // Asegurar que el stock no sea negativo
      if (updatedProduct.stock_quantity < 0) {
        await this.prisma.product.update({
          where: { id },
          data: { stock_quantity: 0 },
        });
        updatedProduct.stock_quantity = 0;
      }

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
