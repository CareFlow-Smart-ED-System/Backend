import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  HttpCode,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { LoginResponseDto, TokenResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: this.parseDurationToMs(process.env.JWT_EXPIRATION || '15m'),
    };
  }

  private getRefreshCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: this.parseDurationToMs(
        process.env.JWT_REFRESH_EXPIRATION || '7d',
      ),
    };
  }

  private parseDurationToMs(duration: string | number): number | undefined {
    if (typeof duration === 'number') {
      return duration * 1000;
    }

    const match = /^([0-9]+)(ms|s|m|h|d)$/.exec(duration);
    if (!match) {
      return undefined;
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };

    return value * multipliers[unit];
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate a user and issue session tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    response.cookie('accessToken', result.accessToken, this.getCookieOptions());
    response.cookie(
      'refreshToken',
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Invalidate the current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user.sub);
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.sub);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh the access token using a refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      refreshTokenDto.refreshToken || (request as any).cookies?.refreshToken;
    const result = await this.authService.refreshToken({ refreshToken });
    response.cookie('accessToken', result.accessToken, this.getCookieOptions());
    response.cookie(
      'refreshToken',
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );
    return result;
  }

  @Post('revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(200)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Revoke all sessions for a specific user (ADMIN only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({ status: 200, description: 'All sessions revoked for the user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async revokeToken(@Body('userId') userId: string) {
    await this.authService.logout(userId);
    return { message: `All sessions revoked for user ${userId}` };
  }

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Update the current password' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Passwords do not match' })
  @ApiResponse({ status: 401, description: 'Unauthorized or incorrect current password' })
  async updatePassword(
    @CurrentUser() user: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.updatePassword(
      user.sub,
      updatePasswordDto,
    );
    response.cookie('accessToken', result.accessToken, this.getCookieOptions());
    response.cookie(
      'refreshToken',
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );
    return result;
  }
}
