import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
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
      const { buffer, mimeType } = this.parseBase64Image(
        personImageBase64,
        'person_image',
      );

      if (this.shouldMockResponses()) {
        return this.mockTorsoDetectionResponse();
      }

      const formData = new FormData();
      const blob = new Blob(
        [this.bufferToArrayBuffer(buffer)],
        { type: mimeType },
      );
      formData.append('person_image', blob, 'person.jpg');

      const response = await axios.post(
        `${this.aiApiUrl}/detect-torso`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleAiError('detección de torso', error);
    }
  }

  async virtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    try {
      const personImage = this.parseBase64Image(
        request.personImage,
        'person_image',
      );
      const clothingImage = this.parseBase64Image(
        request.clothingImage,
        'clothing_image',
      );

      if (this.shouldMockResponses()) {
        return this.mockVirtualTryOnResponse(request);
      }

      const formData = new FormData();

      const personBlob = new Blob(
        [this.bufferToArrayBuffer(personImage.buffer)],
        {
          type: personImage.mimeType,
        },
      );
      const clothingBlob = new Blob(
        [this.bufferToArrayBuffer(clothingImage.buffer)],
        {
          type: clothingImage.mimeType,
        },
      );

      formData.append('person_image', personBlob, 'person.jpg');
      formData.append('clothing_image', clothingBlob, 'clothing.jpg');
      formData.append('clothing_type', request.clothingType);

      if (request.stylePreferences) {
        formData.append(
          'style_preferences',
          JSON.stringify(request.stylePreferences),
        );
      }

      const response = await axios.post(
        `${this.aiApiUrl}/virtual-try-on`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleAiError('try-on virtual', error);
    }
  }

  async analyzeClothingFit(personImageBase64: string, clothingImageBase64: string): Promise<ClothingFitAnalysisResponse> {
    try {
      const personImage = this.parseBase64Image(
        personImageBase64,
        'person_image',
      );
      const clothingImage = this.parseBase64Image(
        clothingImageBase64,
        'clothing_image',
      );

      if (this.shouldMockResponses()) {
        return this.mockClothingFitResponse();
      }

      const formData = new FormData();

      const personBlob = new Blob(
        [this.bufferToArrayBuffer(personImage.buffer)],
        {
          type: personImage.mimeType,
        },
      );
      const clothingBlob = new Blob(
        [this.bufferToArrayBuffer(clothingImage.buffer)],
        {
          type: clothingImage.mimeType,
        },
      );

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
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleAiError('análisis de ajuste', error);
    }
  }

  async generateMultipleAngles(
    personImageBase64: string, 
    clothingImageBase64: string, 
    angles: string[] = ['front', 'side', 'back']
  ) {
    try {
      const personImage = this.parseBase64Image(
        personImageBase64,
        'person_image',
      );
      const clothingImage = this.parseBase64Image(
        clothingImageBase64,
        'clothing_image',
      );

      if (this.shouldMockResponses()) {
        return this.mockMultipleAnglesResponse(angles);
      }

      const formData = new FormData();

      const personBlob = new Blob(
        [this.bufferToArrayBuffer(personImage.buffer)],
        {
          type: personImage.mimeType,
        },
      );
      const clothingBlob = new Blob(
        [this.bufferToArrayBuffer(clothingImage.buffer)],
        {
          type: clothingImage.mimeType,
        },
      );

      formData.append('person_image', personBlob, 'person.jpg');
      formData.append('clothing_image', clothingBlob, 'clothing.jpg');
      formData.append('angles', (angles ?? ['front', 'side', 'back']).join(','));

      const response = await axios.post(
        `${this.aiApiUrl}/multiple-angles`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 90000,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleAiError('generación de múltiples ángulos', error);
    }
  }

  async enhanceImage(imageBase64: string, enhancementType: string = 'realistic') {
    try {
      const image = this.parseBase64Image(imageBase64, 'image');

      if (this.shouldMockResponses()) {
        return this.mockEnhanceImageResponse(enhancementType);
      }

      const formData = new FormData();

      const imageBlob = new Blob(
        [this.bufferToArrayBuffer(image.buffer)],
        { type: image.mimeType },
      );
      formData.append('image', imageBlob, 'image.jpg');
      formData.append('enhancement_type', enhancementType ?? 'realistic');

      const response = await axios.post(
        `${this.aiApiUrl}/enhance-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.handleAiError('mejora de imagen', error);
    }
  }

  async checkAiServiceHealth(): Promise<boolean> {
    if (this.shouldMockResponses()) {
      return true;
    }

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

  private parseBase64Image(imageBase64: string, fieldName: string) {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new BadRequestException(
        `El campo ${fieldName} es obligatorio y debe ser una cadena base64 válida`,
      );
    }

    const trimmed = imageBase64.trim();
    let mimeType = 'image/jpeg';
    let payload = trimmed;

    const dataUriMatch = trimmed.match(
      /^data:(?<mime>[^;]+);base64,(?<data>[A-Za-z0-9+/=]+)$/i,
    );

    if (dataUriMatch?.groups?.data) {
      mimeType = dataUriMatch.groups.mime || mimeType;
      payload = dataUriMatch.groups.data;
    } else if (trimmed.includes(',')) {
      payload = trimmed.split(',').pop() ?? '';
    }

    const sanitizedPayload = payload.replace(/\s+/g, '');
    if (
      !sanitizedPayload ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(sanitizedPayload) ||
      sanitizedPayload.length % 4 !== 0
    ) {
      throw new BadRequestException(
        `El campo ${fieldName} debe ser una cadena base64 válida`,
      );
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(sanitizedPayload, 'base64');
    } catch (error) {
      throw new BadRequestException(
        `El campo ${fieldName} debe ser una cadena base64 válida`,
      );
    }

    if (
      !buffer.length ||
      buffer.toString('base64').replace(/=+$/g, '') !==
        sanitizedPayload.replace(/=+$/g, '')
    ) {
      throw new BadRequestException(
        `El campo ${fieldName} debe ser una cadena base64 válida`,
      );
    }

    return {
      buffer,
      mimeType,
    };
  }

  private bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(buffer.byteLength);
    const view = new Uint8Array(arrayBuffer);
    view.set(buffer);
    return arrayBuffer;
  }

  private shouldMockResponses() {
    return process.env.NODE_ENV === 'test' || process.env.MOCK_PYTHON_API === 'true';
  }

  private mockTorsoDetectionResponse(): TorsoDetectionResponse {
    return {
      success: true,
      message: 'Análisis de torso simulado',
      analysis: {
        torsoDetected: true,
        confidence: 0.93,
      },
    };
  }

  private mockVirtualTryOnResponse(
    request: VirtualTryOnRequest,
  ): VirtualTryOnResponse {
    return {
      success: true,
      message: 'Try-on virtual simulado',
      generated_images: [
        {
          data: 'base64-mock-try-on-image',
          mime_type: 'image/png',
        },
      ],
      metadata: {
        clothingType: request.clothingType,
        stylePreferences: request.stylePreferences ?? null,
      },
    };
  }

  private mockClothingFitResponse(): ClothingFitAnalysisResponse {
    return {
      success: true,
      message: 'Análisis de ajuste simulado',
      analysis: {
        fitScore: 0.88,
        recommendations: ['Considerar una talla más', 'Ajustar cintura'],
      },
    };
  }

  private mockMultipleAnglesResponse(angles?: string[]) {
    const safeAngles = angles && angles.length > 0 ? angles : ['front', 'side', 'back'];
    return {
      success: true,
      message: 'Generación de ángulos simulada',
      generated_images: safeAngles.map((angle) => ({
        angle,
        data: `base64-mock-image-${angle}`,
      })),
    };
  }

  private mockEnhanceImageResponse(enhancementType?: string) {
    return {
      success: true,
      message: 'Mejora de imagen simulada',
      data: {
        enhancementType: enhancementType ?? 'realistic',
        image: 'base64-mock-enhanced-image',
      },
    };
  }

  private handleAiError(context: string, error: any): never {
    console.error(`Error en ${context}:`, error?.message ?? error);
    throw new HttpException(
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error en el servicio de IA durante ${context}`,
        error: error?.message ?? 'Error desconocido',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
