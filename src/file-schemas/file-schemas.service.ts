import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SchemaDefinition,
  SchemaDefinitionDocument,
} from './schemas/file-schemas.schema';
import { CreateFileSchemaDto } from './dtos/create-file-schema.dto';

@Injectable()
export class FileSchemasService {
  constructor(
    @InjectModel(SchemaDefinition.name)
    private schemaModel: Model<SchemaDefinitionDocument>,
  ) {}

  async create(
    createSchemaDto: CreateFileSchemaDto,
  ): Promise<SchemaDefinition> {
    const existingSchema = await this.schemaModel
      .findOne({ schemaName: createSchemaDto.schemaName })
      .exec();

    if (existingSchema) {
      throw new ConflictException(
        `Um esquema com o nome '${createSchemaDto.schemaName}' já existe.`,
      );
    }

    const newSchema = new this.schemaModel(createSchemaDto);
    return newSchema.save();
  }

  async findByName(name: string): Promise<SchemaDefinitionDocument | null> {
    const schema = await this.schemaModel.findOne({ schemaName: name }).exec();
    return schema;
  }

  async findAll(): Promise<SchemaDefinition[]> {
    return this.schemaModel.find().exec();
  }

  async deleteByName(name: string): Promise<{ deleted: boolean }> {
    const result = await this.schemaModel
      .deleteOne({ schemaName: name })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Schema not found');
    }
    return { deleted: true };
  }
}
