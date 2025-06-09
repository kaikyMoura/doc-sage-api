import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type SchemaDefinitionDocument = HydratedDocument<SchemaDefinition>;

@Schema({ timestamps: true })
export class SchemaDefinition {
  @Prop({ required: true, unique: true, trim: true })
  schemaName: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  jsonSchema: Record<string, any>;
}

export const SchemaDefinitionSchema =
  SchemaFactory.createForClass(SchemaDefinition);
