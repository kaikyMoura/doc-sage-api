import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma/prisma.service';
import { UserSessionModule } from '../user-session/user-session.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './token.service';
import { TwilioService } from './utils/twilio.service';

@Module({
  imports: [PassportModule, MailModule, UserSessionModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthController,
    AuthService,
    TwilioService,
    TokenService,
    PrismaService,
    JwtStrategy,
  ],
  exports: [AuthService, AuthController],
})
export class AuthModule {}
