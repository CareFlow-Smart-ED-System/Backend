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
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingStatusDto } from './dto/update-billing-status.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { SkipResponseWrap } from '@common/decorators/skip-response-wrap.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BillingStatus, UserRole } from '@prisma/client';

@ApiTags('billing')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('billing')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a bill for a completed case' })
  @ApiBody({ type: CreateBillingDto })
  @ApiResponse({
    status: 201,
    description: 'Bill created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Bill created successfully' },
        billId: { type: 'string', example: 'uuid' },
        caseId: { type: 'string', example: 'uuid' },
        amount: { type: 'number', example: 150.00 },
        status: { type: 'string', example: 'PENDING' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Case not completed or bill already exists' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  createBill(@Body() dto: CreateBillingDto) {
    return this.billingService.createBill(dto);
  }

  @Get('billing')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all bills with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: BillingStatus, description: 'Filter by billing status' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List of bills retrieved',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              billId: { type: 'string' },
              caseId: { type: 'string' },
              patientName: { type: 'string' },
              amount: { type: 'number' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  getAllBills(
    @Query('status') status?: BillingStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.billingService.getAllBills(status, Number(page), Number(limit));
  }

  @Get('billing/unbilled-completed-cases')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @SkipResponseWrap()
  @ApiOperation({ summary: 'Get completed cases that do not yet have billing' })
  @ApiResponse({
    status: 200,
    description: 'Completed cases without billing retrieved successfully',
    schema: {
      type: 'object',
      example: {
        total: 2,
        data: [
          {
            caseId: 'uuid',
            patientId: 'uuid',
            patientName: 'John Doe',
            severity: 'URGENT',
            arrivalTime: '2026-05-10T12:00:00Z',
            status: 'COMPLETED',
          },
        ],
      },
      properties: {
        total: { type: 'number', example: 2 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              caseId: { type: 'string', example: 'uuid' },
              patientId: { type: 'string', example: 'uuid' },
              patientName: { type: 'string', example: 'John Doe' },
              severity: { type: 'string', example: 'URGENT' },
              arrivalTime: { type: 'string', format: 'date-time', example: '2026-05-10T12:00:00Z' },
              status: { type: 'string', example: 'COMPLETED' },
            },
          },
        },
      },
    },
  })
  getUnbilledCompletedCases() {
    return this.billingService.getUnbilledCompletedCases();
  }

  @Get('billing/:billId')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get bill details by ID' })
  @ApiParam({ name: 'billId', type: 'string', description: 'The bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Bill details retrieved',
    schema: {
      type: 'object',
      properties: {
        billId: { type: 'string' },
        caseId: { type: 'string' },
        patientName: { type: 'string' },
        amount: { type: 'number' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  getBillById(@Param('billId', ParseUUIDPipe) billId: string) {
    return this.billingService.getBillById(billId);
  }

  @Patch('billing/:billId/status')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update bill payment status' })
  @ApiParam({ name: 'billId', type: 'string', description: 'The bill ID' })
  @ApiBody({ type: UpdateBillingStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Bill status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Bill status updated successfully' },
        billId: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  updateBillStatus(
    @Param('billId', ParseUUIDPipe) billId: string,
    @Body() dto: UpdateBillingStatusDto,
  ) {
    return this.billingService.updateBillStatus(billId, dto);
  }

  @Get('cases/:caseId/billing')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get bill for a specific case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({
    status: 200,
    description: 'Bill for the case retrieved',
    schema: {
      type: 'object',
      properties: {
        billId: { type: 'string' },
        caseId: { type: 'string' },
        patientName: { type: 'string' },
        amount: { type: 'number' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Bill not found for this case' })
  getBillByCase(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.billingService.getBillByCase(caseId);
  }
}