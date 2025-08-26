import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from "class-validator";
import { Transform, Type } from "class-transformer";

export class PaginationDto {
  page: number = 1;
  limit: number = 10;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export class SortDto {
  field!: string;
  direction: SortDirection = SortDirection.ASC;
}

export class QueryDto extends PaginationDto {
  search?: string;
  sort?: SortDto;
  filters?: Record<string, any>;
}

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}
