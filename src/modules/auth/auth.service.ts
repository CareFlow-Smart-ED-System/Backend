import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PasswordService } from '@common/password.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async register() {
    // TODO: Implement registration logic
  }

  async login() {
    // TODO: Implement login logic
  }

  async logout() {
    // TODO: Implement logout logic
  }

  async getProfile() {
    // TODO: Implement get profile logic
  }

  async refreshToken() {
    // TODO: Implement refresh token logic
  }

  async forgotPassword() {
    // TODO: Implement forgot password logic
  }

  async resetPassword() {
    // TODO: Implement reset password logic
  }

  async updatePassword() {
    // TODO: Implement update password logic
  }
}
