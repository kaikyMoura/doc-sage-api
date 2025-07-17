import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessorService } from '../image-processor/image-processor.service';
import { DocumentService } from './document.service';
import { ValidationService } from '../validation/validation.service';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService, ImageProcessorService, ValidationService],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
