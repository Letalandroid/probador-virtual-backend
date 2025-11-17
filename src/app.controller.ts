import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AiService } from './ai/ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/status')
  async getServiceStatus() {
    const timeout = 3000; // 3 segundos
    const startTime = Date.now();

    const checkServices = async () => {
      const services = {
        backend: false,
        database: false,
        aiService: false,
      };

      // Verificar backend (si llegamos aquí, está activo)
      services.backend = true;

      // Verificar base de datos
      try {
        await Promise.race([
          this.prisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database timeout')), timeout - 500)
          ),
        ]);
        services.database = true;
      } catch (error) {
        services.database = false;
      }

      // Verificar servicio de IA
      try {
        const aiHealth = await Promise.race([
          this.aiService.checkAiServiceHealth(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('AI service timeout')), timeout - 500)
          ),
        ]);
        services.aiService = aiHealth;
      } catch (error) {
        services.aiService = false;
      }

      const elapsedTime = Date.now() - startTime;
      const allActive = services.backend && services.database && services.aiService;

      return {
        status: allActive ? 'active' : 'degraded',
        services,
        responseTime: elapsedTime,
        timestamp: new Date().toISOString(),
      };
    };

    try {
      return await Promise.race([
        checkServices(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), timeout)
        ),
      ]);
    } catch (error) {
      return {
        status: 'timeout',
        services: {
          backend: true,
          database: false,
          aiService: false,
        },
        responseTime: timeout,
        timestamp: new Date().toISOString(),
        error: 'La verificación de servicios tardó más de 3 segundos',
      };
    }
  }
}
