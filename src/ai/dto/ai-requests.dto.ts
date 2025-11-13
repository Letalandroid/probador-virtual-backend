import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const mapBodyField = (fieldName: string) =>
  Transform(({ value, obj }) => {
    if (value !== undefined && value !== null) {
      return value;
    }

    if (obj && typeof obj === 'object' && fieldName in obj) {
      return obj[fieldName];
    }

    return value;
  }, { toClassOnly: true });

const normalizeAngles = Transform(({ value, obj }) => {
  const source = value ?? obj?.angles;

  if (source === undefined || source === null) {
    return undefined;
  }

  if (Array.isArray(source)) {
    return source.map((angle) => String(angle).trim()).filter(Boolean);
  }

  if (typeof source === 'string') {
    return source
      .split(',')
      .map((angle: string) => angle.trim())
      .filter(Boolean);
  }

  return undefined;
}, { toClassOnly: true });

export class TorsoDetectionDto {
  @mapBodyField('person_image')
  @IsString()
  @IsNotEmpty()
  personImage: string;
}

export class VirtualTryOnDto {
  @mapBodyField('person_image')
  @IsString()
  @IsNotEmpty()
  personImage: string;

  @mapBodyField('clothing_image')
  @IsString()
  @IsNotEmpty()
  clothingImage: string;

  @mapBodyField('clothing_type')
  @IsString()
  @IsNotEmpty()
  clothingType: string;

  @mapBodyField('style_preferences')
  @IsOptional()
  stylePreferences?: any;
}

export class ClothingFitAnalysisDto {
  @mapBodyField('person_image')
  @IsString()
  @IsNotEmpty()
  personImage: string;

  @mapBodyField('clothing_image')
  @IsString()
  @IsNotEmpty()
  clothingImage: string;
}

export class MultipleAnglesDto {
  @mapBodyField('person_image')
  @IsString()
  @IsNotEmpty()
  personImage: string;

  @mapBodyField('clothing_image')
  @IsString()
  @IsNotEmpty()
  clothingImage: string;

  @normalizeAngles
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  angles?: string[];
}

export class ImageEnhancementDto {
  @mapBodyField('image')
  @IsString()
  @IsNotEmpty()
  image: string;

  @mapBodyField('enhancement_type')
  @IsOptional()
  @IsString()
  enhancementType?: string;
}
