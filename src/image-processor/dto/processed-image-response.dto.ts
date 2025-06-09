import { IsString } from 'class-validator';

export class ProcessedImageResponse {
  @IsString()
  filename: string;

  @IsString()
  content_type: string;

  @IsString()
  image_base64: string;
}
