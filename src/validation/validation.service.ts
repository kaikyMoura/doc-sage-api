import { Injectable } from '@nestjs/common';
import { z, ZodType, ZodError } from 'zod';
import { ValidationJson } from './schemas/validation-json.schema';

@Injectable()
export class ValidationService {
  public validate(
    schemaJson: ValidationJson,
    data: unknown,
  ): z.SafeParseReturnType<any, any> {
    try {
      const validator = this.buildValidatorFromSchema(schemaJson);
      return validator.safeParse(data);
    } catch (error) {
      console.error('Error parsing schema', error);
      const zodError = new ZodError([
        {
          code: 'custom',
          path: ['_schema'],
          message: `Internal error: ${error.message}`,
        },
      ]);
      return { success: false, error: zodError };
    }
  }

  private buildValidatorFromSchema(schemaJson: ValidationJson): ZodType {
    return this._parseSchemaNode(schemaJson.jsonSchema);
  }

  private _parseSchemaNode(node: any): ZodType {
    if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
      const shape: { [key: string]: ZodType } = {};
      for (const key in node) {
        shape[key] = this._parseSchemaNode(node[key]);
      }
      return z.object(shape);
    }

    if (Array.isArray(node)) {
      if (node.length === 0) {
        return z.array(z.any());
      }
      const itemSchema = this._parseSchemaNode(node[0]);
      return z.array(itemSchema);
    }

    if (typeof node === 'string') {
      const parts = node.split('|').map((p) => p.trim());
      const isNullable = parts.includes('null');
      const mainType = parts.find((p) => p !== 'null');

      let validator: ZodType;

      if (mainType && mainType.includes(' | ')) {
        const enumOptions = mainType.split(' | ').map((o) => o.trim());
        validator = z.enum(enumOptions as [string, ...string[]]);
      } else {
        switch (mainType) {
          case 'string':
            validator = z.string();
            break;
          case 'number':
            validator = z.number();
            break;
          case 'boolean':
            validator = z.boolean();
            break;
          case 'date':
            validator = z.coerce.date();
            break;
          default:
            validator = z.any();
            break;
        }
      }

      if (isNullable) {
        return validator.nullable().optional();
      }
      return validator;
    }

    return z.any();
  }
}
