import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginUserDto } from 'src/user/dtos/login-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dtos/change-password-user.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiBody({ type: LoginUserDto })
  @Public()
  @ApiOperation({ summary: 'Login' })
  async login(
    @Body() body: LoginUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.userService.retrieveUserByCredentials(body);

    const tokens = await this.authService.createSession(
      user,
      req.headers['user-agent'] || 'unknown',
      req.ip,
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokens = await this.authService.refreshSession(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      await this.authService.revokeSession(refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    res.status(204).send();
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Forgot password' })
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() resetPasswordDto: ChangePasswordDto) {
    const { token } = resetPasswordDto;

    if (!token) {
      throw new BadRequestException('Token is missing');
    }

    const result = await this.authService.resetPassword(
      token,
      resetPasswordDto,
    );

    if (!result) {
      throw new BadRequestException('Password reset failed');
    }

    return { message: result };
  }
}
