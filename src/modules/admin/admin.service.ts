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
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async listUsers(query?: any) {
    // Default pagination
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;

    const where = {
      role: query?.role
        ? query.role
        : {
            not: UserRole.PATIENT,
          },
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users.map((u) => ({
        userId: u.id,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
      })),
    };
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
  async getAuditLogs(query?: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.actionType) where.actionType = query.actionType;
    if (query?.userId) where.userId = query.userId;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { displayName: true } } },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: logs.map((l) => ({
        id: l.id,
        actionType: l.actionType,
        performedBy: l.user?.displayName ?? l.userId,
        targetId: l.targetId,
        details: l.details,
        timestamp: l.timestamp,
      })),
    };
  }

  async createAuditLog(dto: CreateAuditLogDto) {
    const { actionType, userId, targetId, details } = dto as any;

    const created = await this.prisma.auditLog.create({
      data: {
        actionType,
        userId,
        targetId: targetId ?? null,
        details: details ?? null,
      },
    });

    return {
      message: 'Audit log created',
      data: {
        id: created.id,
        actionType: created.actionType,
        userId: created.userId,
        targetId: created.targetId,
        details: created.details,
        timestamp: created.timestamp,
      },
    };
  }

  async updateUser(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (dto.displayName) updateData.displayName = dto.displayName;
    if (dto.role) updateData.role = dto.role;

    // Update user basic fields
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true },
    });

    // Handle doctor / nurse relations
    if (dto.role === 'DOCTOR') {
      if (dto.specialization) {
        await this.prisma.doctor.upsert({
          where: { userId },
          update: { specialization: dto.specialization },
          create: { userId, specialization: dto.specialization },
        });
      }
    } else {
      // remove doctor if exists
      await this.prisma.doctor.deleteMany({ where: { userId } });
    }

    if (dto.role === 'NURSE') {
      if (dto.department) {
        await this.prisma.nurse.upsert({
          where: { userId },
          update: { department: dto.department },
          create: { userId, department: dto.department },
        });
      }
    } else {
      await this.prisma.nurse.deleteMany({ where: { userId } });
    }

    return { message: 'User updated successfully', userId: updated.id };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'User deleted successfully', userId, deletedAt: new Date().toISOString() };
  }
}
