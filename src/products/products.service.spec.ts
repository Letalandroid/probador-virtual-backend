import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    category_id: '1',
    brand: 'Test Brand',
    color: 'Blue',
    sizes: ['S', 'M', 'L'],
    images: ['image1.jpg', 'image2.jpg'],
    stock_quantity: 10,
    is_active: true,
    gender: 'men',
    fabric_type: 'cotton',
    fabric_composition: '100% cotton',
    care_instructions: 'Machine wash cold',
    season: 'all_season',
    style: 'casual',
    fit_type: 'regular',
    measurements: {
      chest: 100,
      waist: 80,
      length: 70,
    },
    ai_metadata: {
      clothing_type: 'shirt',
      colors: ['blue', 'navy'],
    },
    clothing_type: 'shirt',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: '1',
  };

  const mockCategory = {
    id: '1',
    name: 'Shirts',
    description: 'T-Shirts and Shirts',
    is_active: true,
  };

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category_id: '1',
        brand: 'Test Brand',
        color: 'Blue',
        sizes: ['S', 'M', 'L'],
        images: ['image1.jpg'],
        stock_quantity: 10,
        gender: 'men',
        fabric_type: 'cotton',
        fabric_composition: '100% cotton',
        care_instructions: 'Machine wash cold',
        season: 'all_season',
        style: 'casual',
        fit_type: 'regular',
        measurements: {
          chest: 100,
          waist: 80,
          length: 70,
        },
        ai_metadata: {
          clothing_type: 'shirt',
          colors: ['blue', 'navy'],
        },
        clothing_type: 'shirt',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.createProduct(createProductDto, '1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: createProductDto.category_id },
      });
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          created_by: '1',
        },
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      const createProductDto = {
        name: 'Test Product',
        price: 100,
        category_id: 'nonexistent',
        stock_quantity: 10,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.createProduct(createProductDto, '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockTotal);

      const result = await service.findAll(1, 10, 'men', '1', 'test');

      expect(result).toEqual({
        data: mockProducts,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter products by gender', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'women');

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            gender: 'women',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 150,
      };

      const updatedProduct = { ...mockProduct, ...updateProductDto };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('1', updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateProductDto,
        include: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

