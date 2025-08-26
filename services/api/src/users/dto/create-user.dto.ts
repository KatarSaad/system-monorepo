import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.USER,
    required: false
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}