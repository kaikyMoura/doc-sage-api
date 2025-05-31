import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [AuthModule],
  providers: [
    UserService,
    UserRepository,
    UserResolver,
    EmailService,
    PrismaService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
