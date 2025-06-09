import { Test, TestingModule } from '@nestjs/testing';
import { FileSchemasController } from './file-schemas.controller';

describe('FileSchemasController', () => {
  let controller: FileSchemasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSchemasController],
    }).compile();

    controller = module.get<FileSchemasController>(FileSchemasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
