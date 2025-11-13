import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { AppModule } from '../../src/app.module';
import request from 'supertest';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const TEST_USER_EMAIL = 'test@example.com';

  const cleanupUserData = async (email: string) => {
    if (!prismaService) {
      return;
    }

    const users = await prismaService.user.findMany({
      where: { email },
      select: { id: true },
    });

    if (!users.length) {
      return;
    }

    const userIds = users.map((user) => user.id);

    await prismaService.$transaction([
      prismaService.userRoleAssignment.deleteMany({
        where: { user_id: { in: userIds } },
      }),
      prismaService.profile.deleteMany({
        where: { user_id: { in: userIds } },
      }),
      prismaService.user.deleteMany({
        where: { id: { in: userIds } },
      }),
    ]);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await cleanupUserData(TEST_USER_EMAIL);
    await app.close();
  });

  beforeEach(async () => {
    // Clean up only the data created by this test suite to avoid interfering with other suites
    await cleanupUserData(TEST_USER_EMAIL);
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: TEST_USER_EMAIL,
        password: 'password123',
        full_name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.full_name).toBe(userData.full_name);
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: TEST_USER_EMAIL,
        password: 'password123',
        full_name: 'Test User',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: TEST_USER_EMAIL,
          password: 'password123',
          full_name: 'Test User',
        });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: TEST_USER_EMAIL,
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: TEST_USER_EMAIL,
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: TEST_USER_EMAIL,
          password: 'password123',
          full_name: 'Test User',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USER_EMAIL,
          password: 'password123',
        });

      accessToken = loginResponse.body.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', TEST_USER_EMAIL);
      expect(response.body).toHaveProperty('full_name', 'Test User');
    });

    it('should return error without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return error with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
