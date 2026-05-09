import {
  Controller,
  Get,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async getNotifications(@CurrentUser() user: any) {
    // TODO: Implement get notifications
  }

  @Put(':notificationId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('notificationId') notificationId: string) {
    // TODO: Implement mark as read
  }

  @Put(':notificationId/unread')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a notification as unread' })
  @ApiResponse({ status: 200, description: 'Notification marked as unread' })
  async markAsUnread(@Param('notificationId') notificationId: string) {
    // TODO: Implement mark as unread
  }
}
