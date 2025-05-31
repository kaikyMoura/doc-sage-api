import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; description: string } {
    return {
      message: 'Welcome to the DocSage api!',
      description: 'Check the documentation `/docs` for more information.',
    };
  }
}
