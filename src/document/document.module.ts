import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentController } from './document.controller';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';

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
  ],
  providers: [DocumentResolver, DocumentService, PrismaService],
  controllers: [DocumentController],
})
export class DocumentModule {}
