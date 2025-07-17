import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { TokenPayloadDto } from '../dtos/token-payload.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET_KEY');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET_KEY is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates the given payload and returns the user data if the
   * validation is successful.
   *
   * @param payload - The payload to validate.
   *
   * @throws {UnauthorizedException} - Thrown if the payload is invalid or
   * expired.
   *
   * @returns {Promise<{ id: string; email: string }>} - The user data if the
   * validation is successful.
   */
  async validate(
    payload: TokenPayloadDto,
  ): Promise<{ id: string; email: string }> {
    try {
      this.logger.log('Validating token...');
      const user = await this.userService.retrieveById(payload.sub);

      if (payload.email !== user.email) {
        this.logger.error('Invalid or expired token');
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (!user) throw new UnauthorizedException('Invalid or expired token');

      return { id: user.id!, email: user.email };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error validating token: ${err.message as string}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
