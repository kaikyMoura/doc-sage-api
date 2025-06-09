import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchemasController } from './file-schemas.controller';
import { FileSchemasService } from './file-schemas.service';
import {
  SchemaDefinition,
  SchemaDefinitionSchema,
} from './schemas/file-schemas.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SchemaDefinition.name, schema: SchemaDefinitionSchema },
    ]),
  ],
  providers: [FileSchemasService],
  controllers: [FileSchemasController],
  exports: [FileSchemasService],
})
export class FileSchemasModule {}
