import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async listUsers() {
    // TODO: Implement list users
  }

  @Post('users/staff')
  @HttpCode(201)
  async createStaffUser() {
    // TODO: Implement create staff user
  }

  @Put('users/:userId')
  async updateUser(@Param('userId') userId: string) {
    // TODO: Implement update user
  }

  @Get('audit-logs')
  async getAuditLogs() {
    // TODO: Implement get audit logs
  }
}
