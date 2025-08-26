import { IsString, IsEmail, IsOptional, IsUUID, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseEntitySchema {
  @IsUUID()
  id: string = '';

  @IsDateString()
  createdAt: string = '';

  @IsDateString()
  updatedAt: string = '';
}

export class PaginationSchema {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder: 'asc' | 'desc' = 'desc';
}

export class ContactSchema {
  @IsString()
  name: string = '';

  @IsEmail()
  email: string = '';

  @IsOptional()
  @IsString()
  phone?: string;
}