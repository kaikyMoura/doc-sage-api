import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { FileSchemasService } from './file-schemas.service';
import { CreateFileSchemaDto } from './dtos/create-file-schema.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('file-schemas')
export class FileSchemasController {
  constructor(private readonly schemasService: FileSchemasService) {}

  @Post()
  @ApiBody({
    type: CreateFileSchemaDto,
  })
  @ApiBearerAuth()
  async create(@Body() createSchemaDto: CreateFileSchemaDto) {
    return this.schemasService.create(createSchemaDto);
  }

  @Get()
  @ApiBearerAuth()
  async findAll() {
    return this.schemasService.findAll();
  }

  @Get(':name')
  @ApiBearerAuth()
  async findOne(@Param('name') name: string) {
    const schema = await this.schemasService.findByName(name);
    if (!schema) {
      throw new NotFoundException(
        `Esquema com o nome '${name}' não encontrado.`,
      );
    }
    return schema;
  }

  @Delete(':name')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('name') name: string) {
    await this.schemasService.deleteByName(name);
  }
}
