import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsEnum, IsDecimal, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Camiseta Básica' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del producto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio del producto', example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'ID de la categoría del producto' })
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ description: 'Marca del producto', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Color del producto', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Tallas disponibles', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiProperty({ description: 'URLs de las imágenes del producto', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Cantidad en stock', example: 100 })
  @IsNumber()
  @Min(0)
  stock_quantity: number;

  @ApiProperty({ description: 'Género del producto', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: 'Estado activo del producto', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Nombre del producto', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descripción del producto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio del producto', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'ID de la categoría del producto', required: false })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({ description: 'Marca del producto', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Color del producto', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Tallas disponibles', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiProperty({ description: 'URLs de las imágenes del producto', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Cantidad en stock', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @ApiProperty({ description: 'Género del producto', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: 'Estado activo del producto', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nombre de la categoría', example: 'Camisetas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción de la categoría', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL de la imagen de la categoría', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ description: 'Estado activo de la categoría', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Nombre de la categoría', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descripción de la categoría', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL de la imagen de la categoría', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ description: 'Estado activo de la categoría', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
