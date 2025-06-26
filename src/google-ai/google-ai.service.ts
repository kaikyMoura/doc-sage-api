import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAIService {
  private readonly logger = new Logger(GoogleAIService.name);
  private readonly client: ImageAnnotatorClient;
  private readonly genAI: GoogleGenerativeAI;

  /**
   * Initializes the GoogleAIService with necessary configurations.
   *
   * Sets up the Google Cloud Vision `ImageAnnotatorClient` using credentials
   * from the environment. Also initializes the `GoogleGenerativeAI` client
   * with an API key fetched from the configuration service.
   *
   * @param configService A service to access application configuration values.
   * @throws {InternalServerErrorException} If the GEMINI_API_KEY is not set.
   */
  constructor(private readonly configService: ConfigService) {
    this.client = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    const apiKey = configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('The GEMINI_API_KEY is not set.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Sends a prompt to the Gemini AI service and parses the response.
   *
   * @param prompt The prompt to send to the AI service.
   * @returns A JSON object where the keys are the field names and the values are the extracted values
   * @throws {BadRequestException} if no prompt is provided.
   * @throws {InternalServerErrorException} if the request to the AI service fails.
   */
  public async askAndParseResponse(
    prompt: string,
  ): Promise<Record<string, string>> {
    if (!prompt) {
      this.logger.error('No prompt provided.');
      throw new BadRequestException('No prompt provided.');
    }

    const generationConfig: GenerationConfig = {
      responseMimeType: 'application/json',
      temperature: 0.2, // Low temperature for more consistent and structured responses
    };

    const model = this.genAI.getGenerativeModel(
      {
        model: 'gemini-2.0-flash',
        generationConfig,
      },
      { timeout: 60000 },
    );

    this.logger.log('Sending prompt to the model...');

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      this.logger.log('Received response from the model: ' + responseText);

      if (!responseText) {
        this.logger.error('The response text is empty.');
        throw new InternalServerErrorException('The response text is empty.');
      }

      this.logger.log('Received response from the model.');
      return JSON.parse(responseText) as Record<string, string>;
    } catch (error) {
      this.logger.error(
        'Error invoking or processing the response from the Gemini API',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );

      throw new InternalServerErrorException(
        'Failed to communicate with the AI service.',
      );
    }
  }

  /**
   * Extracts text from an image using Google Cloud Vision's document text
   * detection feature.
   *
   * @param imageBuffer The image to extract text from.
   * @returns The extracted text, if any.
   * @throws {InternalServerErrorException} if an error occurs during the
   * extraction process.
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      this.logger.log('Starting text extraction...');

      const [result] = await this.client.documentTextDetection({
        image: {
          content: imageBuffer,
        },
      });

      const fullTextAnnotation = result.fullTextAnnotation;

      if (fullTextAnnotation?.text) {
        this.logger.log('Text extracted successfully.');
        return fullTextAnnotation.text;
      } else {
        this.logger.warn('Text extraction failed. No text found in the image.');
        return '';
      }
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('Error extracting text from image:', error.stack);
      throw new InternalServerErrorException(
        'Internal server error while extracting text from image.',
      );
    }
  }
}
