import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AiService } from './ai.service';
import {
  ClothingFitAnalysisDto,
  ImageEnhancementDto,
  MultipleAnglesDto,
  TorsoDetectionDto,
  VirtualTryOnDto,
} from './dto/ai-requests.dto';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('detect-torso')
  @HttpCode(HttpStatus.OK)
  async detectTorso(@Body() torsoDetectionDto: TorsoDetectionDto) {
    const result = await this.aiService.detectTorso(torsoDetectionDto.personImage);
    return {
      success: true,
      data: result,
      message: 'Análisis de torso completado exitosamente',
    };
  }

  @Post('virtual-try-on')
  @HttpCode(HttpStatus.OK)
  async virtualTryOn(@Body() virtualTryOnDto: VirtualTryOnDto) {
    const result = await this.aiService.virtualTryOn(virtualTryOnDto);
    return {
      success: true,
      data: result,
      message: 'Try-on virtual completado exitosamente',
    };
  }

  @Post('analyze-clothing-fit')
  @HttpCode(HttpStatus.OK)
  async analyzeClothingFit(@Body() clothingFitDto: ClothingFitAnalysisDto) {
    const result = await this.aiService.analyzeClothingFit(
      clothingFitDto.personImage,
      clothingFitDto.clothingImage,
    );
    return {
      success: true,
      data: result,
      message: 'Análisis de ajuste completado exitosamente',
    };
  }

  @Post('multiple-angles')
  @HttpCode(HttpStatus.OK)
  async generateMultipleAngles(@Body() multipleAnglesDto: MultipleAnglesDto) {
    const result = await this.aiService.generateMultipleAngles(
      multipleAnglesDto.personImage,
      multipleAnglesDto.clothingImage,
      multipleAnglesDto.angles,
    );
    return {
      success: true,
      data: result,
      message: 'Múltiples ángulos generados exitosamente',
    };
  }

  @Post('enhance-image')
  @HttpCode(HttpStatus.OK)
  async enhanceImage(@Body() imageEnhancementDto: ImageEnhancementDto) {
    const result = await this.aiService.enhanceImage(
      imageEnhancementDto.image,
      imageEnhancementDto.enhancementType,
    );
    return {
      success: true,
      data: result,
      message: 'Imagen mejorada exitosamente',
    };
  }

  @Get('health')
  async getHealthStatus() {
    return this.buildHealthResponse();
  }

  @Post('health-check')
  @HttpCode(HttpStatus.OK)
  async postHealthStatus() {
    return this.buildHealthResponse();
  }

  private async buildHealthResponse() {
    const isHealthy = await this.aiService.checkAiServiceHealth();
    return {
      status: isHealthy ? 'healthy' : 'unavailable',
      message: isHealthy
        ? 'Servicio de IA disponible'
        : 'Servicio de IA no disponible',
      details: {
        aiServiceAvailable: isHealthy,
      },
    };
  }
}
