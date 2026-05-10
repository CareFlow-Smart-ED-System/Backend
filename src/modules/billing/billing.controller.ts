import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingStatusDto } from './dto/update-billing-status.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BillingStatus, UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // POST /api/v1/billing
  @Post('billing')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  createBill(@Body() dto: CreateBillingDto) {
    return this.billingService.createBill(dto);
  }

  // GET /api/v1/billing
  @Get('billing')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  getAllBills(
    @Query('status') status?: BillingStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.billingService.getAllBills(status, Number(page), Number(limit));
  }

  // GET /api/v1/billing/:billId
  @Get('billing/:billId')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  getBillById(@Param('billId', ParseUUIDPipe) billId: string) {
    return this.billingService.getBillById(billId);
  }

  // PATCH /api/v1/billing/:billId/status
  @Patch('billing/:billId/status')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  updateBillStatus(
    @Param('billId', ParseUUIDPipe) billId: string,
    @Body() dto: UpdateBillingStatusDto,
  ) {
    return this.billingService.updateBillStatus(billId, dto);
  }

  // GET /api/v1/cases/:caseId/billing
  @Get('cases/:caseId/billing')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  getBillByCase(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.billingService.getBillByCase(caseId);
  }
}