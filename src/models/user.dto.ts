import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@ejemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario', example: 'usuario@ejemplo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Email del usuario', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Nombre completo del usuario', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name?: string;

  @ApiProperty({ description: 'Contraseña del usuario', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class ChangeUserRoleDto {
  @ApiProperty({ description: 'Rol del usuario', enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

export class ChangeUserStatusDto {
  @ApiProperty({ description: 'Estado activo del usuario' })
  @IsNotEmpty()
  is_active: boolean;
}

export class CreateProfileDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ description: 'Teléfono del usuario', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Dirección del usuario', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Ciudad del usuario', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Código postal del usuario', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ description: 'País del usuario', required: false, default: 'Colombia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'URL del avatar del usuario', required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ description: 'Nombre completo del usuario', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name?: string;

  @ApiProperty({ description: 'Teléfono del usuario', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Dirección del usuario', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Ciudad del usuario', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Código postal del usuario', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ description: 'País del usuario', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'URL del avatar del usuario', required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
