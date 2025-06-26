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

  /**
   * Creates a new schema in the database.
   *
   * @param createSchemaDto The data transfer object containing the schema details.
   * @returns A promise that resolves to the newly created `SchemaDefinition`.
   * @throws ConflictException If a schema with the same name already exists.
   */
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

  /**
   * Finds a schema by its name.
   *
   * @param name The name of the schema to find.
   * @returns A promise that resolves to a `SchemaDefinitionDocument` if a schema
   *          with the given name exists, or `null` if no such schema is found.
   */
  async findByName(name: string): Promise<SchemaDefinitionDocument | null> {
    return await this.schemaModel.findOne({ schemaName: name }).exec();
  }

  /**
   * Finds all existing schemas in the database.
   *
   * @returns A promise that resolves to an array of `SchemaDefinition` objects.
   */
  async findAll(): Promise<SchemaDefinition[]> {
    return this.schemaModel.find().exec();
  }

  /**
   * Delete a schema by name.
   *
   * @param name The name of the schema to delete.
   *
   * @returns A promise that resolves to an object with a single property
   *          `deleted` set to `true` if the schema was found and deleted,
   *          or throws a `NotFoundException` if no schema with the given
   *          name was found.
   */
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
