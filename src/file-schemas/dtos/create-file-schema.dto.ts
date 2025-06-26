import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateFileSchemaDto {
  @ApiProperty({ example: 'ServiceContract' })
  @IsString({ message: 'Schema name must be a text' })
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Schema name must be at least 3 characters long',
  })
  schemaName?: string;

  @ApiProperty({ example: 'Service Contract' })
  @IsString({ message: 'Description must be a text' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '{}' })
  @IsObject({ message: 'JSON schema must be an object' })
  @IsNotEmpty()
  jsonSchema: Record<string, any>;
}
