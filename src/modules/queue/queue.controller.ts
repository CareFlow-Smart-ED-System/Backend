import { 
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
 } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('queue')
@ApiCookieAuth('accessToken')
@Controller('api/v1/queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('priority')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the priority queue' })
  @ApiResponse({ status: 200, description: 'Priority queue' })
  async getPriorityQueue( @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,) {
    return this.queueService.getPriorityQueue(page, limit);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStatistics() {
  return this.queueService.getQueueStatistics();
  }
}
