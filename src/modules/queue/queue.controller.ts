import { 
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
 } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('queue')
@ApiCookieAuth('accessToken')
@Controller('api/v1/queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('priority')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the priority queue of emergency cases' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Priority queue retrieved',
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
              position: { type: 'number' },
              caseId: { type: 'string' },
              patientName: { type: 'string' },
              severity: { type: 'string' },
              status: { type: 'string' },
              arrivalTime: { type: 'string', format: 'date-time' },
              waitingMinutes: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getPriorityQueue( @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,) {
    return this.queueService.getPriorityQueue(page, limit);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get queue statistics and metrics' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics retrieved',
    schema: {
      type: 'object',
      properties: {
        totalWaiting: { type: 'number' },
        bySeverity: { type: 'object' },
        averageWaitMinutes: { type: 'number' },
      },
    },
  })
  async getQueueStatistics() {
  return this.queueService.getQueueStatistics();
  }
}
