import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PasswordService } from '@common/password.service';
import { CreateStaffUserDto, ResetPasswordDto } from './dto/create-staff-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async listUsers() {
    // TODO: Implement list users logic
  }

  async createStaffUser(createStaffUserDto: CreateStaffUserDto) {
    const { email, displayName, role, temporaryPassword } = createStaffUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash temporary password
    const passwordHash = await this.passwordService.hashPassword(temporaryPassword);

    // Create user with mustChangePassword = true
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName,
        role: role as any,
        passwordHash,
        mustChangePassword: true, // User must change password on first login
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      message: 'Staff user created successfully. User must change password on first login.',
    };
  }

  async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto) {
    const { newTemporaryPassword } = resetPasswordDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new temporary password
    const passwordHash = await this.passwordService.hashPassword(newTemporaryPassword);

    // Update password and set mustChangePassword = true
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true, // Force password change on next login
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedUser,
      message: 'Password reset successfully. User must change password on next login.',
    };
  }

  async getAuditLogs() {
    // TODO: Implement get audit logs logic
  }

  async updateUser() {
    // TODO: Implement update user logic
  }
}
