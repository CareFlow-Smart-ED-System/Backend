import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post(':caseId')
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  async createBill(@Param('caseId') caseId: string) {
    // TODO: Implement create bill
  }

  @Get(':billId')
  async getBillDetails(@Param('billId') billId: string) {
    // TODO: Implement get bill details
  }

  @Put(':billId/payment-status')
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  async updatePaymentStatus(@Param('billId') billId: string) {
    // TODO: Implement update payment status
  }

  @Get('case/:caseId')
  async getBillingByCase(@Param('caseId') caseId: string) {
    // TODO: Implement get billing by case
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  async listBills() {
    // TODO: Implement list bills
  }
}
