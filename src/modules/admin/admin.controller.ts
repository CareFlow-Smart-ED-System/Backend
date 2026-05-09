import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateStaffUserDto, ResetPasswordDto, UpdateUserDto } from './dto/create-staff-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query';
import { GetAuditLogsQueryDto } from './dto/audit-logs.query';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('admin')
@ApiCookieAuth('accessToken')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Post('users')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new staff user account',
    description:
      'Creates a new staff user account with the specified role. Only ADMIN users can create staff accounts after logging in once and reusing the stored access token.',
  })
  @ApiBody({
    type: CreateStaffUserDto,
    examples: {
      doctor: {
        summary: 'Create a Doctor',
        value: {
          displayName: 'Dr. Sara Ahmed',
          email: 'sara.ahmed@careflow.com',
          password: 'SecurePass123!',
          dateOfBirth: '2000-01-15',
          gender: 'FEMALE',
          role: 'DOCTOR',
          specialization: 'Cardiology',
        },
      },
      nurse: {
        summary: 'Create a Nurse',
        value: {
          displayName: 'Jane Smith',
          email: 'jane.smith@careflow.com',
          password: 'SecurePass123!',
          dateOfBirth: '1995-05-20',
          gender: 'FEMALE',
          role: 'NURSE',
          department: 'Emergency',
        },
      },
      receptionist: {
        summary: 'Create a Receptionist',
        value: {
          displayName: 'John Doe',
          email: 'john.doe@careflow.com',
          password: 'SecurePass123!',
          dateOfBirth: '1990-03-10',
          gender: 'MALE',
          role: 'RECEPTIONIST',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Staff user created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Staff registered successfully' },
            userId: { type: 'string' },
            displayName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
            mustChangePassword: { type: 'boolean' },
            specialization: { type: 'string', nullable: true },
            department: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Missing required fields or invalid role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async createStaffUser(@Body() createStaffUserDto: CreateStaffUserDto) {
    return this.adminService.createStaffUser(createStaffUserDto);
  }

  @Patch('users/:userId/reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset user password (ADMIN only)' })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The user ID',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      example1: {
        summary: 'Reset password request',
        value: {
          newTemporaryPassword: 'TempPass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Password reset successfully' },
            mustChangePassword: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(
    @Param('userId') userId: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.adminService.resetPassword(userId, resetPasswordDto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              action: { type: 'string' },
              userId: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getAuditLogs(@Query() query: GetAuditLogsQueryDto) {
    return this.adminService.getAuditLogs(query);
  }

  @Patch('users/:userId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user profile or role (ADMIN only)' })
  @ApiParam({ name: 'userId', type: 'string' })
  async updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(userId, dto);
  }

  @Delete('users/:userId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a user (ADMIN only)' })
  @ApiParam({ name: 'userId', type: 'string' })
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }
}
