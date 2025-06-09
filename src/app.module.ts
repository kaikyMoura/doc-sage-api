import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { EmailModule } from './email/email.module';
import { ImageProcessorModule } from './image-processor/image-processor.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';
import { ValidationModule } from './validation/validation.module';
import { FileSchemasModule } from './file-schemas/file-schemas.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleAiModule } from './google-ai/google-ai.module';

@Module({
  imports: [
    AuthModule,
    EmailModule,
    DocumentModule,
    GoogleAiModule,
    HttpModule,
    ImageProcessorModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ImageProcessorModule,
    ValidationModule,
    MongooseModule.forRoot(process.env.MONGO_URI!),
    FileSchemasModule,
  ],
  controllers: [AppController],
  providers: [
    AuthController,
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
