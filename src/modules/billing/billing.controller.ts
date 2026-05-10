import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
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
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async createBill(@Param('caseId') caseId: string) {
    // TODO: Implement create bill
  }

  @Get(':billId')
  @ApiOperation({ summary: 'Get bill details' })
  @ApiParam({ name: 'billId', type: 'string', description: 'The bill ID' })
  @ApiResponse({ status: 200, description: 'Bill details retrieved' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async getBillDetails(@Param('billId') billId: string) {
    // TODO: Implement get bill details
  }

  @Put(':billId/payment-status')
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Update bill payment status' })
  @ApiParam({ name: 'billId', type: 'string', description: 'The bill ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: ['PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID'] }, paymentMethod: { type: 'string' }, paidAmount: { type: 'number' } }, required: ['status'] } })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async updatePaymentStatus(@Param('billId') billId: string) {
    // TODO: Implement update payment status
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get billing records for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({ status: 200, description: 'Billing records retrieved' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getBillingByCase(@Param('caseId') caseId: string) {
    // TODO: Implement get billing by case
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'List all bills' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by payment status' })
  @ApiResponse({ status: 200, description: 'Bills list retrieved' })
  async listBills() {
    // TODO: Implement list bills
  }
}
