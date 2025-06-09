import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import 'multer';
import { extname } from 'path';
import { ImageProcessorService } from 'src/image-processor/image-processor.service';
import { ValidationJson } from 'src/validation/schemas/validation-json.schema';
import { ValidationService } from 'src/validation/validation.service';
import { SafeParseSuccess } from 'zod';
import { GoogleAIService } from '../google-ai/google-ai.service';
import { PDFService } from './utils/pdf.service';
import { FileSchemasService } from 'src/file-schemas/file-schemas.service';
import { readFileSync } from 'fs';

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
   * Processes a document represented as a string, using the given document type
   * and an optional custom prompt. The document type is used to determine the
   * schema of the output, and the custom prompt is used to generate the prompt
   * given to the LLM. The LLM response is parsed according to the schema, and if
   * the parsing is successful, the parsed result is returned.
   *
   * @throws {BadRequestException} if the document type is unknown
   * @throws {BadRequestException} if the LLM response is invalid
   * @throws {BadRequestException} if the parsed result does not match the schema
   * @returns {Promise<z.infer<(typeof documentTypes)[T]>>} the parsed result
   */
  async processFile(
    schemaName: string,
    text: string,
  ): Promise<SafeParseSuccess<any>> {
    const schema = await this.schemasService.findByName(schemaName);
    if (!schema) {
      throw new NotFoundException(`Schema ${schemaName} not found`);
    }

    const prompt = this.buildPrompt(schema.jsonSchema, text);

    console.log(prompt);

    const llmResponse = await this.googleAIService.askAndParseResponse(prompt);

    const validationResult = this.validationService.validate(
      schema.jsonSchema as ValidationJson,
      llmResponse,
    );

    if (!validationResult.success) {
      throw new BadRequestException({
        message:
          'The LLM response is invalid. Please check the validation errors.',
        validationErrors: validationResult.error.flatten().fieldErrors,
        extractedData: llmResponse,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return validationResult.data;
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

  private buildPrompt(schema: any, text: string): string {
    const schemaString = JSON.stringify(schema, null, 2);
    return `
      Given the text below, extract and return a JSON object with the following exact fields.
      Do not include any additional fields, and use the property names and structure exactly as shown.
      If any optional data is not present in the text, return the field with null or an empty string.
      Return a valid JSON object only. Do not add explanations or markdown formatting.

      Field schema:
      ${schemaString}

      Document:
      """${text}"""
    `;
  }
}
