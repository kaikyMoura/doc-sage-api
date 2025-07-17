import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileSchemasModule } from '../file-schemas/file-schemas.module';
import { GoogleAIService } from '../google-ai/google-ai.service';
import { ImageProcessorModule } from '../image-processor/image-processor.module';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationModule } from '../validation/validation.module';
import { DocumentController } from './document.controller';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { PDFService } from './utils/pdf.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    HttpModule,
    FileSchemasModule,
    ValidationModule,
    ImageProcessorModule,
  ],
  providers: [
    DocumentResolver,
    GoogleAIService,
    PDFService,
    DocumentService,
    PrismaService,
  ],
  controllers: [DocumentController],
})
export class DocumentModule {}
