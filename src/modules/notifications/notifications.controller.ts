import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiCookieAuth('accessToken')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'isRead', required: false, type: String, description: 'Filter by read status (true/false)' })
  @ApiResponse({
    status: 200,
    description: 'Notifications list retrieved',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        unread: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              caseId: { type: 'string', nullable: true },
              message: { type: 'string' },
              type: { type: 'string' },
              isRead: { type: 'boolean' },
              readAt: { type: 'string', format: 'date-time', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getNotifications(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isRead') isRead?: string,
  ) {
    const isReadBool =
      isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    return this.notificationsService.getNotifications(
      user.sub,
      page,
      limit,
      isReadBool,
    );
  }

  @Patch('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read', schema: { type: 'object', properties: { message: { type: 'string' }, updatedCount: { type: 'number' } } } })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.sub);
  }
  
  @Patch(':notificationId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({ name: 'notificationId', type: 'string', description: 'The notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', schema: { type: 'object', properties: { message: { type: 'string' }, notificationId: { type: 'string' } } } })
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationsService.markAsRead(notificationId, user.sub);
  }
}
