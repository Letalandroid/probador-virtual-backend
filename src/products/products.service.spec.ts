import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { CreateProductDto, UpdateProductDto } from '../models/product.dto';
import { Prisma } from '@prisma/client';

// Mock de PrismaService
const mockPrismaService = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category_id: 'category-id',
      brand: 'Test Brand',
      color: 'Red',
      sizes: ['S', 'M', 'L'],
      images: ['image1.jpg', 'image2.jpg'],
      stock_quantity: 10,
      is_active: true,
      gender: 'unisex',
    };

    const userId = 'user-id';

    it('should create a product successfully', async () => {
      // Arrange
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      const mockProduct = {
        id: 'product-id',
        ...createProductDto,
        created_by: userId,
        category: mockCategory,
        user: {
          id: userId,
          email: 'test@example.com',
          full_name: 'Test User',
        },
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      // Act
      const result = await service.createProduct(createProductDto, userId);

      // Assert
      expect(result).toEqual({
        status: 201,
        message: 'Producto creado exitosamente',
        product: mockProduct,
      });

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-id' },
      });
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
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
    });

    it('should throw NotFoundException when category does not exist', async () => {
      // Arrange
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createProduct(createProductDto, userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });

    it('should handle Prisma validation errors', async () => {
      // Arrange
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      
      const prismaError = new Prisma.PrismaClientValidationError('Validation error', {
        clientVersion: '5.0.0',
      });
      mockPrismaService.product.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.createProduct(createProductDto, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllProducts', () => {
    it('should return products with pagination', async () => {
      // Arrange
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          price: 100,
          category: { id: 'cat-1', name: 'Category 1' },
          user: { id: 'user-1', email: 'user1@example.com', full_name: 'User 1' },
        },
        {
          id: 'product-2',
          name: 'Product 2',
          price: 200,
          category: { id: 'cat-2', name: 'Category 2' },
          user: { id: 'user-2', email: 'user2@example.com', full_name: 'User 2' },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(2);

      // Act
      const result = await service.getAllProducts(1, 10);

      // Assert
      expect(result).toEqual({
        products: mockProducts,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        skip: 0,
        take: 10,
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
    });

    it('should filter by category when provided', async () => {
      // Arrange
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.getAllProducts(1, 10, 'category-id');

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { 
          is_active: true,
          category_id: 'category-id',
        },
        skip: 0,
        take: 10,
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
    });

    it('should search products when search term provided', async () => {
      // Arrange
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.getAllProducts(1, 10, undefined, 'test search');

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { 
          is_active: true,
          OR: [
            { name: { contains: 'test search', mode: 'insensitive' } },
            { description: { contains: 'test search', mode: 'insensitive' } },
            { brand: { contains: 'test search', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
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
    });
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      // Arrange
      const mockProduct = {
        id: 'product-id',
        name: 'Test Product',
        price: 100,
        category: { id: 'cat-1', name: 'Category 1' },
        user: { id: 'user-1', email: 'user1@example.com', full_name: 'User 1' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await service.getProductById('product-id');

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-id' },
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
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProductById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    const updateProductDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 150,
    };

    const userId = 'user-id';
    const productId = 'product-id';

    it('should update product successfully', async () => {
      // Arrange
      const existingProduct = {
        id: productId,
        created_by: userId,
        name: 'Original Product',
      };

      const updatedProduct = {
        id: productId,
        ...updateProductDto,
        category: { id: 'cat-1', name: 'Category 1' },
        user: { id: userId, email: 'user@example.com', full_name: 'User' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.updateProduct(productId, updateProductDto, userId);

      // Assert
      expect(result).toEqual({
        status: 200,
        message: 'Producto actualizado exitosamente',
        product: updatedProduct,
      });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
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
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProduct(productId, updateProductDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should validate category when category_id is provided', async () => {
      // Arrange
      const updateWithCategory = { ...updateProductDto, category_id: 'new-category-id' };
      const existingProduct = { id: productId, created_by: userId };
      const mockCategory = { id: 'new-category-id', name: 'New Category' };
      const updatedProduct = { id: productId, ...updateWithCategory };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      await service.updateProduct(productId, updateWithCategory, userId);

      // Assert
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-category-id' },
      });
    });

    it('should throw NotFoundException when new category does not exist', async () => {
      // Arrange
      const updateWithCategory = { ...updateProductDto, category_id: 'non-existent-category' };
      const existingProduct = { id: productId, created_by: userId };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProduct(productId, updateWithCategory, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    const userId = 'user-id';
    const productId = 'product-id';

    it('should delete product successfully', async () => {
      // Arrange
      const existingProduct = {
        id: productId,
        created_by: userId,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.delete.mockResolvedValue({});

      // Act
      const result = await service.deleteProduct(productId, userId);

      // Assert
      expect(result).toEqual({
        status: 200,
        message: 'Producto eliminado exitosamente',
      });

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteProduct(productId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProductsByCategory', () => {
    it('should call getAllProducts with category filter', async () => {
      // Arrange
      const categoryId = 'category-id';
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.getProductsByCategory(categoryId, 1, 10);

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { 
          is_active: true,
          category_id: categoryId,
        },
        skip: 0,
        take: 10,
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
    });
  });

  describe('searchProducts', () => {
    it('should call getAllProducts with search filter', async () => {
      // Arrange
      const searchTerm = 'test search';
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      // Act
      await service.searchProducts(searchTerm, 1, 10);

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { 
          is_active: true,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { brand: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
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
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      // Arrange
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Featured Product 1',
          category: { id: 'cat-1', name: 'Category 1' },
          user: { id: 'user-1', email: 'user1@example.com', full_name: 'User 1' },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      // Act
      const result = await service.getFeaturedProducts(5);

      // Assert
      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        take: 5,
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
    });
  });

  describe('updateProductStock', () => {
    const productId = 'product-id';

    it('should update stock successfully', async () => {
      // Arrange
      const existingProduct = {
        id: productId,
        stock_quantity: 10,
      };

      const updatedProduct = {
        id: productId,
        stock_quantity: 15,
        category: { id: 'cat-1', name: 'Category 1' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.updateProductStock(productId, 5);

      // Assert
      expect(result).toEqual({
        status: 200,
        message: 'Stock actualizado exitosamente',
        product: updatedProduct,
      });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          stock_quantity: 15,
        },
        include: {
          category: true,
        },
      });
    });

    it('should not allow negative stock', async () => {
      // Arrange
      const existingProduct = {
        id: productId,
        stock_quantity: 5,
      };

      const updatedProduct = {
        id: productId,
        stock_quantity: 0,
        category: { id: 'cat-1', name: 'Category 1' },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.updateProductStock(productId, -10);

      // Assert
      expect(result.product.stock_quantity).toBe(0);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProductStock(productId, 5)).rejects.toThrow(NotFoundException);
    });
  });
});