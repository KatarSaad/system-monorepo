import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class BulkUserOperationDto {
  @ApiProperty({
    description: 'Array of user IDs to perform operation on',
    example: ['cuid123456789', 'cuid987654321'],
    type: [String]
  })
  @IsArray()
  @IsUUID('all', { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'Operation to perform on selected users',
    enum: ['activate', 'deactivate', 'delete', 'verify'],
    example: 'activate'
  })
  @IsEnum(['activate', 'deactivate', 'delete', 'verify'])
  operation: 'activate' | 'deactivate' | 'delete' | 'verify';

  @ApiProperty({
    description: 'Additional data for the operation',
    example: {},
    required: false
  })
  @IsOptional()
  data?: any;
}