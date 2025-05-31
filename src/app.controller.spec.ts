import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return an object with message and description', () => {
      expect(appController.getHello()).toStrictEqual({
        message: 'Welcome to the DocSage api!',
        description: 'Check the documentation `/docs` for more information.',
      });
    });
  });
});
