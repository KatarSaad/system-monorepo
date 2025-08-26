import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Remember user session for extended period',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}