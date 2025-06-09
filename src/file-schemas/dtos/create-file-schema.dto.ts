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
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  schemaName: string;

  @ApiProperty({ example: 'Service Contract' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '{}' })
  @IsObject()
  @IsNotEmpty()
  jsonSchema: Record<string, any>;
}
