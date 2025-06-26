import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import 'multer';
import { extname } from 'path';
import { CreateFileSchemaDto } from 'src/file-schemas/dtos/create-file-schema.dto';
import { FileSchemasService } from 'src/file-schemas/file-schemas.service';
import { ImageProcessorService } from 'src/image-processor/image-processor.service';
import { ValidationJson } from 'src/validation/schemas/validation-json.schema';
import { ValidationService } from 'src/validation/validation.service';
import { GoogleAIService } from '../google-ai/google-ai.service';
import { PDFService } from './utils/pdf.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly imagePreprocessorService: ImageProcessorService,
    private readonly validationService: ValidationService,
    private readonly pdfService: PDFService,
    private readonly googleAIService: GoogleAIService,
    private readonly schemasService: FileSchemasService,
  ) {}

  /**
   * Process a file (text or PDF) using the LLM and
   * validate the response against the provided schema.
   *
   * If a schema name is provided, the schema will be retrieved
   * from the database and the response will be validated against it.
   * If no schema is provided, the response will not be validated.
   *
   * @param text The text to process.
   * @param formatTo The format to convert the text to.
   * @param schema The schema to use for validation, or its name to retrieve from the database.
   * @returns The processed file in the specified format.
   * @throws {BadRequestException} If the LLM response is invalid.
   * @throws {NotFoundException} If the schema is not found in the database.
   */
  async processFile(
    text: string,
    formatTo: string,
    schema?: CreateFileSchemaDto,
  ): Promise<Record<string, string>> {
    this.logger.log('Initializing file processing...');

    let effectiveSchema: any = null;

    if (schema && typeof schema === 'object' && schema.schemaName) {
      this.logger.log(
        `Schema name '${schema.schemaName}' provided. Retrieving from database...`,
      );
      const retrievedSchema = await this.schemasService.findByName(
        schema.schemaName,
      );

      if (!retrievedSchema) {
        throw new NotFoundException(
          `Schema with name '${schema.schemaName}' not found in the database.`,
        );
      }

      effectiveSchema = retrievedSchema.jsonSchema;
      this.logger.log(
        `Schema '${schema.schemaName}' found and will be used for processing.`,
      );
    } else if (schema && typeof schema === 'object') {
      this.logger.log(
        'A direct schema object was provided. Using it for processing.',
      );
      effectiveSchema = schema;
    } else {
      this.logger.log('No schema provided. Processing in inference mode.');
    }

    const prompt = this.buildPrompt(effectiveSchema, text, formatTo);
    this.logger.log('Prompt successfully built.');

    const llmResponse = await this.googleAIService.askAndParseResponse(prompt);
    this.logger.log('Received response from LLM.');

    if (effectiveSchema) {
      this.logger.log(
        'Validating LLM response against the effective schema...',
      );
      const validationResult = this.validationService.validate(
        effectiveSchema as ValidationJson,
        llmResponse,
      );

      if (!validationResult.success) {
        this.logger.error(
          'LLM response validation failed.',
          validationResult.error.flatten(),
        );
        throw new BadRequestException({
          message:
            'The LLM response is invalid. Please check the validation errors.',
          validationErrors: validationResult.error.flatten().fieldErrors,
          extractedData: llmResponse,
        });
      }

      this.logger.debug('Validation successful.');
      return JSON.stringify(
        validationResult.data,
        null,
        2,
      ) as unknown as Record<string, string>;
    }

    this.logger.log('No schema was used, returning raw LLM response.');
    return llmResponse;
  }

  /**
   * Extracts text from the given file.
   *
   * @param file The file to process.
   * @returns The extracted text.
   * @throws If the file does not exist.
   * @throws If the file is not a PDF or an image.
   * @private
   */
  async extractTextFromFIle(file: Express.Multer.File): Promise<string> {
    this.logger.log('Extracting text from file...');
    const ext = extname(file.originalname).toLowerCase();
    console.log(file);
    if (ext === '.pdf') {
      this.logger.log('File type is PDF, extracting text...');
      return await this.pdfService.extractTextFromPDF(file.path);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      this.logger.log(`File type is ${ext}, extracting text...`);
      // // Preprocess the image
      // const processedBuffer =
      //   await this.imagePreprocessorService.processImage(file);

      // // Save the processed image to a temporary file
      // const tempFilePath = path.join(
      //   __dirname,
      //   '..',
      //   'uploads',
      //   `${uuid()}.png`,
      // );

      // // Create the directory
      // await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });

      // // Write the processed image to the temporary file
      // await fs.promises.writeFile(
      //   tempFilePath,
      //   processedBuffer.image_base64,
      //   'base64',
      // );

      // try {
      // console.log(tempFilePath);
      const fileBuffer = readFileSync(file.path);
      this.logger.log('Extracting text from image...');
      return await this.googleAIService.extractTextFromImage(fileBuffer);
      // } finally {
      //   fs.unlinkSync(tempFilePath); // Clean up temp file
      // }
    } else {
      this.logger.error('Unsupported file type.');
      throw new UnsupportedMediaTypeException('Unsupported file type');
    }
  }

  /**
   * Recursively converts a JSON object to a markdown list.
   *
   * @param obj The object to convert
   * @param indentLevel The indentation level to use for the list.
   *                      Defaults to 0.
   * @returns A markdown string representing the object as a list.
   */
  jsonToMarkdownList(obj: Record<string, unknown>, indentLevel = 0): string {
    return Object.entries(obj)
      .flatMap(([key, value]) => {
        const indent = '  '.repeat(indentLevel);
        const lines = [`${indent}- **${key}:** `];

        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          lines.push(
            ...this.jsonToMarkdownList(
              value as Record<string, unknown>,
              indentLevel + 1,
            ).split('\n'),
          );
        } else if (Array.isArray(value)) {
          lines.push(...value.map((item) => `${indent}  - ${item}`));
        } else {
          lines.push(`${value as string}`);
        }

        return lines.join('\n');
      })
      .join('\n');
  }

  /**
   * Builds a prompt for the LLM based on the given schema and text.
   * If a schema is provided, the prompt will ask the LLM to extract the information
   * from the text and return a JSON object that strictly follows the provided schema.
   * If no schema is provided, the prompt will ask the LLM to convert the text into a
   * well-structured JSON object, where the structure is logically inferred from the
   * information present in the text.
   *
   * @param schema The schema to use for the prompt, if any.
   * @param text The text to process.
   * @param format The format of the expected output, defaults to 'json'.
   * @returns The built prompt.
   */
  private buildPrompt(
    schema: unknown,
    text: string,
    format: string = 'json',
  ): string {
    this.logger.log('Building prompt...');
    const hasSchema = schema && Object.keys(schema).length > 0;

    if (hasSchema) {
      const schemaString = JSON.stringify(schema, null, 2);
      this.logger.log('Builing prompt with schema...');
      return `
      Given the text below, extract the information and return a ${format.toUpperCase()} object that strictly follows the provided schema.
      Do not include any additional fields. Use the property names and structure exactly as shown.
      If a field's data is not present in the text, use null for its value.
      Return only the valid ${format.toUpperCase()} object, without any explanations or markdown formatting.

      Schema:
      ${schemaString}

      Document:
      """${text}"""
    `;
    } else {
      this.logger.log('Builing prompt without a schema...');
      return `
      Analyze the text below and convert it into a well-structured ${format.toUpperCase()} object.
      The structure of the ${format.toUpperCase()} object should be logically inferred from the information present in the text.
      The output must be only the valid ${format.toUpperCase()} object, without adding any explanations, comments, or markdown formatting.

      Text:
      """${text}"""
    `;
    }
  }
}
