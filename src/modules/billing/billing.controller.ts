import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('billing')
@ApiCookieAuth('accessToken')
@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post(':caseId')
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a bill for a case' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  async createBill(@Param('caseId') caseId: string) {
    // TODO: Implement create bill
  }

  @Get(':billId')
  @ApiOperation({ summary: 'Get bill details' })
  @ApiResponse({ status: 200, description: 'Bill details' })
  async getBillDetails(@Param('billId') billId: string) {
    // TODO: Implement get bill details
  }

  @Put(':billId/payment-status')
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Update bill payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  async updatePaymentStatus(@Param('billId') billId: string) {
    // TODO: Implement update payment status
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get billing records for a case' })
  @ApiResponse({ status: 200, description: 'Billing records for the case' })
  async getBillingByCase(@Param('caseId') caseId: string) {
    // TODO: Implement get billing by case
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'List bills' })
  @ApiResponse({ status: 200, description: 'Bills list' })
  async listBills() {
    // TODO: Implement list bills
  }
}
