import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateFileSchemaDto {
  @IsOptional()
  @ApiProperty({ example: 'ServiceContract' })
  @IsString({ message: 'Schema name must be a text' })
  @IsNotEmpty({ message: 'Schema name is required' })
  @MinLength(3, {
    message: 'Schema name must be at least 3 characters long',
  })
  schemaName?: string;

  @IsOptional()
  @ApiProperty({ example: 'Service Contract' })
  @IsString({ message: 'Description must be a text' })
  description?: string;

  @IsOptional()
  @ApiProperty({ example: '{}' })
  @IsObject({ message: 'JSON schema must be an object' })
  @IsNotEmpty({ message: 'jsonSchema should not be empty' })
  jsonSchema: Record<string, any>;
}
