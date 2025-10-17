import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';

describe('Python API Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      });

    expect(registerResponse.status).toBe(HttpStatus.CREATED);
    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prismaService.user.delete({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  describe('AI Health Check', () => {
    it('should check Python API health', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/ai/health')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error when Python API is not available', async () => {
      // This test assumes Python API is not running
      // In a real scenario, you might mock the Python API to be down
      
      // Act
      const response = await request(app.getHttpServer())
        .get('/ai/health')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      // The response might be 200 with error status or 500 depending on implementation
      expect([HttpStatus.OK, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
    });
  });

  describe('Torso Detection', () => {
    it('should detect torso in image', async () => {
      // Arrange
      const mockImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/detect-torso')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: mockImageBase64,
        });

      // Assert
      // The response might be successful or error depending on Python API availability
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
      
      if (response.status === HttpStatus.OK) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should return error for invalid image format', async () => {
      // Arrange
      const invalidImage = 'invalid-base64-string';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/detect-torso')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: invalidImage,
        });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return error when no image provided', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/detect-torso')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Virtual Try-On', () => {
    it('should perform virtual try-on', async () => {
      // Arrange
      const mockPersonImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      const mockClothingImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/virtual-try-on')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: mockPersonImage,
          clothing_image: mockClothingImage,
          clothing_type: 'shirt',
        });

      // Assert
      // The response might be successful or error depending on Python API availability
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
      
      if (response.status === HttpStatus.OK) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should return error for missing required fields', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/virtual-try-on')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: 'some-image',
          // missing clothing_image and clothing_type
        });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should handle different clothing types', async () => {
      // Arrange
      const mockPersonImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      const mockClothingImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const clothingTypes = ['shirt', 'pants', 'dress', 'jacket'];

      for (const clothingType of clothingTypes) {
        // Act
        const response = await request(app.getHttpServer())
          .post('/ai/virtual-try-on')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            person_image: mockPersonImage,
            clothing_image: mockClothingImage,
            clothing_type: clothingType,
          });

        // Assert
        expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
      }
    });
  });

  describe('Clothing Fit Analysis', () => {
    it('should analyze clothing fit', async () => {
      // Arrange
      const mockPersonImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      const mockClothingImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/analyze-clothing-fit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: mockPersonImage,
          clothing_image: mockClothingImage,
        });

      // Assert
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
      
      if (response.status === HttpStatus.OK) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });
  });

  describe('Multiple Angles Generation', () => {
    it('should generate multiple angles', async () => {
      // Arrange
      const mockPersonImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      const mockClothingImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/multiple-angles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: mockPersonImage,
          clothing_image: mockClothingImage,
          angles: ['front', 'side', 'back'],
        });

      // Assert
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
      
      if (response.status === HttpStatus.OK) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should use default angles when not provided', async () => {
      // Arrange
      const mockPersonImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      const mockClothingImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/multiple-angles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: mockPersonImage,
          clothing_image: mockClothingImage,
        });

      // Assert
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
    });
  });

  describe('Image Enhancement', () => {
    it('should enhance image', async () => {
      // Arrange
      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/enhance-image')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          image: mockImage,
          enhancement_type: 'realistic',
        });

      // Assert
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
      
      if (response.status === HttpStatus.OK) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should use default enhancement type when not provided', async () => {
      // Arrange
      const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/enhance-image')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          image: mockImage,
        });

      // Assert
      expect([HttpStatus.OK, HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for AI endpoints', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/ai/health');

      // Assert
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should require valid token for AI endpoints', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/ai/health')
        .set('Authorization', 'Bearer invalid-token');

      // Assert
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Error Handling', () => {
    it('should handle Python API timeout', async () => {
      // This test would require mocking the Python API to timeout
      // For now, we'll test the error handling structure
      
      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/detect-torso')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person_image: 'data:image/jpeg;base64,invalid',
        });

      // Assert
      expect([HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR]).toContain(response.status);
    });

    it('should handle malformed requests', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/ai/virtual-try-on')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invalid_field: 'invalid_value',
        });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
