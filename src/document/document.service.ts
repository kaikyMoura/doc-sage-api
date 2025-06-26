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

  async processFile(
    text: string,
    formatTo: string,
    schema?: CreateFileSchemaDto,
  ): Promise<any> {
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
      return validationResult.data;
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
    const ext = extname(file.originalname).toLowerCase();
    console.log(file);
    if (ext === '.pdf') {
      return await this.pdfService.extractTextFromPDF(file.path);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
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
      return await this.googleAIService.extractTextFromImage(fileBuffer);
      // } finally {
      //   fs.unlinkSync(tempFilePath); // Clean up temp file
      // }
    } else {
      throw new UnsupportedMediaTypeException('Unsupported file type');
    }
  }

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
