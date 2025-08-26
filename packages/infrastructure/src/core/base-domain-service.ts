import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';
import { Infrastructure } from './infrastructure';

export interface FieldMapping {
  [logicalField: string]: string;
}

export interface DomainConfig {
  modelName: string;
  fieldMapping: FieldMapping;
  searchFields: string[];
  sortableFields: string[];
  filterableFields: string[];
}

@Injectable()
export abstract class BaseDomainService<T, ID = string> {
  protected abstract readonly config: DomainConfig;
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly infrastructure: Infrastructure,
    protected readonly metrics?: MetricsService
  ) {}

  async create(data: Partial<T>): Promise<Result<T>> {
    try {
      const mappedData = this.mapFieldsToSchema(data);
      const result = await this.infrastructure.repository<T>(this.config.modelName).create(mappedData);
      
      this.metrics?.incrementCounter('domain_operations_total', 1, {
        domain: this.constructor.name,
        operation: 'create'
      });

      return Result.ok(this.mapFieldsFromSchema(result));
    } catch (error: any) {
      this.logger.error(`Failed to create ${this.config.modelName}:`, error);
      return Result.fail(`Failed to create: ${error.message}`);
    }
  }

  async findById(id: ID): Promise<Result<T | null>> {
    try {
      const result = await this.infrastructure.repository<T>(this.config.modelName).findById(id as string);
      
      this.metrics?.incrementCounter('domain_operations_total', 1, {
        domain: this.constructor.name,
        operation: 'findById'
      });

      return Result.ok(result ? this.mapFieldsFromSchema(result) : null);
    } catch (error: any) {
      this.logger.error(`Failed to find ${this.config.modelName}:`, error);
      return Result.fail(`Failed to find: ${error.message}`);
    }
  }

  async search(query: string, options: { page?: number; limit?: number } = {}): Promise<Result<{ data: T[]; total: number }>> {
    try {
      const { page = 1, limit = 10 } = options;
      const result = await this.infrastructure.repository<T>(this.config.modelName).search({
        query,
        fields: this.config.searchFields,
        page,
        limit
      });

      const mappedData = result.data.map(item => this.mapFieldsFromSchema(item));

      return Result.ok({
        data: mappedData,
        total: result.total
      });
    } catch (error: any) {
      this.logger.error(`Failed to search ${this.config.modelName}:`, error);
      return Result.fail(`Search failed: ${error.message}`);
    }
  }

  protected mapFieldsToSchema(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const mapped: any = {};
    for (const [key, value] of Object.entries(data)) {
      const schemaField = this.config.fieldMapping[key] || key;
      mapped[schemaField] = value;
    }
    return mapped;
  }

  protected mapFieldsFromSchema(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const mapped: any = {};
    for (const [key, value] of Object.entries(data)) {
      const entry = Object.entries(this.config.fieldMapping).find(([, schema]) => schema === key);
      const logicalField = entry ? entry[0] : key;
      mapped[logicalField] = value;
    }
    return mapped;
  }

  protected query() {
    return this.infrastructure.query<T>(this.config.modelName);
  }
}