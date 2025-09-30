import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AiService } from './ai.service';

export class VirtualTryOnDto {
  personImage: string; // base64
  clothingImage: string; // base64
  clothingType: string;
  stylePreferences?: any;
}

export class TorsoDetectionDto {
  personImage: string; // base64
}

export class ClothingFitAnalysisDto {
  personImage: string; // base64
  clothingImage: string; // base64
}

export class MultipleAnglesDto {
  personImage: string; // base64
  clothingImage: string; // base64
  angles?: string[];
}

export class ImageEnhancementDto {
  image: string; // base64
  enhancementType?: string;
}

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('detect-torso')
  async detectTorso(@Body() torsoDetectionDto: TorsoDetectionDto) {
    try {
      const result = await this.aiService.detectTorso(torsoDetectionDto.personImage);
      return {
        success: true,
        data: result,
        message: 'Análisis de torso completado exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error en análisis de torso',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('virtual-try-on')
  async virtualTryOn(@Body() virtualTryOnDto: VirtualTryOnDto) {
    try {
      const result = await this.aiService.virtualTryOn(virtualTryOnDto);
      return {
        success: true,
        data: result,
        message: 'Try-on virtual completado exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error en try-on virtual',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze-clothing-fit')
  async analyzeClothingFit(@Body() clothingFitDto: ClothingFitAnalysisDto) {
    try {
      const result = await this.aiService.analyzeClothingFit(
        clothingFitDto.personImage,
        clothingFitDto.clothingImage
      );
      return {
        success: true,
        data: result,
        message: 'Análisis de ajuste completado exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error en análisis de ajuste',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('multiple-angles')
  async generateMultipleAngles(@Body() multipleAnglesDto: MultipleAnglesDto) {
    try {
      const result = await this.aiService.generateMultipleAngles(
        multipleAnglesDto.personImage,
        multipleAnglesDto.clothingImage,
        multipleAnglesDto.angles
      );
      return {
        success: true,
        data: result,
        message: 'Múltiples ángulos generados exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error generando múltiples ángulos',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('enhance-image')
  async enhanceImage(@Body() imageEnhancementDto: ImageEnhancementDto) {
    try {
      const result = await this.aiService.enhanceImage(
        imageEnhancementDto.image,
        imageEnhancementDto.enhancementType
      );
      return {
        success: true,
        data: result,
        message: 'Imagen mejorada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error mejorando imagen',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('health-check')
  async checkHealth() {
    try {
      const isHealthy = await this.aiService.checkAiServiceHealth();
      return {
        success: true,
        data: {
          aiServiceAvailable: isHealthy,
          status: isHealthy ? 'healthy' : 'unavailable',
        },
        message: isHealthy ? 'Servicio de IA disponible' : 'Servicio de IA no disponible',
      };
    } catch (error) {
      return {
        success: false,
        data: {
          aiServiceAvailable: false,
          status: 'error',
        },
        message: 'Error verificando servicio de IA',
        error: error.message,
      };
    }
  }
}

