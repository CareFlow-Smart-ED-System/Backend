import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('api/v1/queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('priority')
  @UseGuards(JwtAuthGuard)
  async getPriorityQueue() {
    // TODO: Implement get priority queue
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getQueueStatistics() {
    // TODO: Implement get queue statistics
  }
}
