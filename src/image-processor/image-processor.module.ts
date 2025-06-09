// src/image-processor/image-processor.module.ts
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageProcessorService } from './image-processor.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      baseURL: process.env.IMAGE_PROCESSOR_API_URL,
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [ImageProcessorService],
  exports: [ImageProcessorService],
})
export class ImageProcessorModule {}
