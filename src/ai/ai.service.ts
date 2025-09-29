import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface VirtualTryOnRequest {
  personImage: string; // base64
  clothingImage: string; // base64
  clothingType: string;
  stylePreferences?: any;
}

export interface VirtualTryOnResponse {
  success: boolean;
  message: string;
  generated_images: Array<{
    data: string; // base64
    mime_type: string;
  }>;
  metadata?: any;
}

export interface TorsoDetectionResponse {
  success: boolean;
  message: string;
  analysis?: any;
}

export interface ClothingFitAnalysisResponse {
  success: boolean;
  message: string;
  analysis?: any;
}

@Injectable()
export class AiService {
  private readonly aiApiUrl: string;

  constructor() {
    this.aiApiUrl = process.env.AI_API_URL || 'http://localhost:8000';
  }

  async detectTorso(personImageBase64: string): Promise<TorsoDetectionResponse> {
    try {
      // Convertir base64 a buffer
      const imageBuffer = Buffer.from(personImageBase64, 'base64');
      
      // Crear FormData para la petición
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      formData.append('person_image', blob, 'person.jpg');

      const response = await axios.post(
        `${this.aiApiUrl}/detect-torso`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 segundos timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error en detección de torso:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error en el servicio de IA',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async virtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    try {
      // Convertir imágenes base64 a buffers
      const personImageBuffer = Buffer.from(request.personImage, 'base64');
      const clothingImageBuffer = Buffer.from(request.clothingImage, 'base64');

      // Crear FormData para la petición
      const formData = new FormData();
      
      const personBlob = new Blob([personImageBuffer], { type: 'image/jpeg' });
      const clothingBlob = new Blob([clothingImageBuffer], { type: 'image/jpeg' });
      
      formData.append('person_image', personBlob, 'person.jpg');
      formData.append('clothing_image', clothingBlob, 'clothing.jpg');
      formData.append('clothing_type', request.clothingType);
      
      if (request.stylePreferences) {
        formData.append('style_preferences', JSON.stringify(request.stylePreferences));
      }

      const response = await axios.post(
        `${this.aiApiUrl}/virtual-try-on`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 segundos timeout para try-on
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error en virtual try-on:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error en el servicio de virtual try-on',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeClothingFit(personImageBase64: string, clothingImageBase64: string): Promise<ClothingFitAnalysisResponse> {
    try {
      // Convertir imágenes base64 a buffers
      const personImageBuffer = Buffer.from(personImageBase64, 'base64');
      const clothingImageBuffer = Buffer.from(clothingImageBase64, 'base64');

      // Crear FormData para la petición
      const formData = new FormData();
      
      const personBlob = new Blob([personImageBuffer], { type: 'image/jpeg' });
      const clothingBlob = new Blob([clothingImageBuffer], { type: 'image/jpeg' });
      
      formData.append('person_image', personBlob, 'person.jpg');
      formData.append('clothing_image', clothingBlob, 'clothing.jpg');

      const response = await axios.post(
        `${this.aiApiUrl}/analyze-clothing-fit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error en análisis de ajuste:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error en el análisis de ajuste',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateMultipleAngles(
    personImageBase64: string, 
    clothingImageBase64: string, 
    angles: string[] = ['front', 'side', 'back']
  ) {
    try {
      // Convertir imágenes base64 a buffers
      const personImageBuffer = Buffer.from(personImageBase64, 'base64');
      const clothingImageBuffer = Buffer.from(clothingImageBase64, 'base64');

      // Crear FormData para la petición
      const formData = new FormData();
      
      const personBlob = new Blob([personImageBuffer], { type: 'image/jpeg' });
      const clothingBlob = new Blob([clothingImageBuffer], { type: 'image/jpeg' });
      
      formData.append('person_image', personBlob, 'person.jpg');
      formData.append('clothing_image', clothingBlob, 'clothing.jpg');
      formData.append('angles', angles.join(','));

      const response = await axios.post(
        `${this.aiApiUrl}/multiple-angles`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 90000, // 90 segundos para múltiples ángulos
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generando múltiples ángulos:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error generando múltiples ángulos',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async enhanceImage(imageBase64: string, enhancementType: string = 'realistic') {
    try {
      // Convertir imagen base64 a buffer
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      // Crear FormData para la petición
      const formData = new FormData();
      
      const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
      formData.append('image', imageBlob, 'image.jpg');
      formData.append('enhancement_type', enhancementType);

      const response = await axios.post(
        `${this.aiApiUrl}/enhance-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error mejorando imagen:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error mejorando imagen',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkAiServiceHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.aiApiUrl}/health`, {
        timeout: 5000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('AI service is not available:', error.message);
      return false;
    }
  }
}
