import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessedImageResponse } from './dto/processed-image-response.dto';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import FormData from 'form-data';
import { readFileSync } from 'fs';

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);
  private readonly processorUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.processorUrl = this.configService.get<string>('IMAGE_PROCESSOR_URL')!;
  }

  /**
   * Processes an image file by sending it to an external image processing service.
   *
   * The file is sent as form data to the service defined by the processor URL.
   * Logs the processing status and handles any errors that may occur during
   * communication with the service.
   *
   * @param file The image file to be processed.
   * @returns A promise that resolves with the processed image response, which
   * includes the filename, content type, and base64 encoded image data.
   * @throws {InternalServerErrorException} If an error occurs during the image
   * processing or if the response from the service is unexpected.
   */
  async processImage(
    file: Express.Multer.File,
  ): Promise<ProcessedImageResponse> {
    const formData = new FormData();

    const fileBuffer = readFileSync(file.path);

    if (!fileBuffer || fileBuffer.length === 0) {
      this.logger.error('Tried to process an empty file.');
      throw new InternalServerErrorException('The file is empty or corrupted.');
    }

    formData.append('file', fileBuffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    this.logger.log(
      `Sending image '${file.originalname}' to be processed at ${this.processorUrl}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<ProcessedImageResponse>(
          this.processorUrl,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        ),
      );

      this.logger.log(
        `The image '${file.originalname}' was processed successfully.`,
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Error communicating with the image service: ${error.message}`,
          error.stack,
        );

        const status = error.response?.status || 500;
        const responseData = error.response?.data as unknown;

        let detail =
          'The image processing service failed or returned an unexpected response.';

        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'detail' in responseData &&
          typeof responseData.detail === 'string'
        ) {
          detail = responseData.detail;
        }

        throw new InternalServerErrorException(`Error ${status}: ${detail}`);
      }

      if (error instanceof Error) {
        this.logger.error(
          `Unexpected error in ImageProcessorService: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          'An unexpected error occurred while processing the image.',
        );
      }

      this.logger.error(
        'An unidentified error without a stack trace was captured in ImageProcessorService',
        error,
      );
      throw new InternalServerErrorException(
        'An unidentified error occurred while processing the image.',
      );
    }
  }
}
