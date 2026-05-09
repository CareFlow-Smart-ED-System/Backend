import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PasswordService } from '@common/password.service';
import { UserRole } from '@prisma/client';
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
    const {
      email,
      displayName,
      password,
      dateOfBirth,
      gender,
      role,
      specialization,
      department,
    } = createStaffUserDto;

    if (role === UserRole.DOCTOR && !specialization) {
      throw new BadRequestException('specialization is required for DOCTOR role');
    }

    if (role === UserRole.NURSE && !department) {
      throw new BadRequestException('department is required for NURSE role');
    }

    // Check if user already exists
    const userModel = this.prisma.user as any;

    const existingUser = await userModel.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash initial password
    const passwordHash = await this.passwordService.hashPassword(password);

    const userData: any = {
      email,
      displayName,
      role,
      passwordHash,
      mustChangePassword: true,
      ...(dateOfBirth && { dateOfBirth }),
      ...(gender && { gender }),
    };

    if (role === UserRole.DOCTOR) {
      userData.doctor = {
        create: {
          specialization,
        },
      };
    }

    if (role === UserRole.NURSE) {
      userData.nurse = {
        create: {
          department,
        },
      };
    }

    const user = await userModel.create({
      data: userData,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        doctor: {
          select: {
            specialization: true,
          },
        },
        nurse: {
          select: {
            department: true,
          },
        },
      },
    }) as any;

    const response = {
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      message: 'Staff registered successfully',
      ...(user.doctor?.specialization && {
        specialization: user.doctor.specialization,
      }),
      ...(user.nurse?.department && {
        department: user.nurse.department,
      }),
    };

    return {
      ...response,
    };
  }

  async resetPassword(userId: string, resetPasswordDto: ResetPasswordDto) {
    const { newTemporaryPassword } = resetPasswordDto;

    const userModel = this.prisma.user as any;

    // Check if user exists
    const user = await userModel.findUnique({
      where: { id: userId as any },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new temporary password
    const passwordHash = await this.passwordService.hashPassword(newTemporaryPassword);

    // Update password and set mustChangePassword = true
    const updatedUser = await userModel.update({
      where: { id: userId as any },
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
    }) as any;

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
