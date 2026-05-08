import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register() {
    // TODO: Implement registration
  }

  @Post('login')
  @HttpCode(200)
  async login() {
    // TODO: Implement login
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@CurrentUser() user: any) {
    // TODO: Implement logout
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    // TODO: Implement get profile
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh() {
    // TODO: Implement refresh token
  }

  @Post('forgot-password')
  async forgotPassword() {
    // TODO: Implement forgot password
  }

  @Post('reset-password')
  async resetPassword() {
    // TODO: Implement reset password
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@CurrentUser() user: any) {
    // TODO: Implement update password
  }
}
