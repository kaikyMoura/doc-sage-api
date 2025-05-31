import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { DocumentResponseDto } from './dtos/document-response.dto';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should process the file and the response should be a DocumentResponseDto instance', () => {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'contrato-XYZ.pdf',
    );
    const buffer = fs.readFileSync(filePath);

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'contrato-XYZ.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: buffer.length,
      buffer: buffer,
      destination: 'uploads/',
      filename: 'contrato-XYZ.pdf',
      path: filePath,
      stream: Readable.from(buffer),
    };

    const result = service.processFile(mockFile);
    expect(result).toBeInstanceOf(DocumentResponseDto);
  });
});
