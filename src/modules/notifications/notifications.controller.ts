import {
  Controller,
  Get,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@CurrentUser() user: any) {
    // TODO: Implement get notifications
  }

  @Put(':notificationId/read')
  @HttpCode(200)
  async markAsRead(@Param('notificationId') notificationId: string) {
    // TODO: Implement mark as read
  }

  @Put(':notificationId/unread')
  @HttpCode(200)
  async markAsUnread(@Param('notificationId') notificationId: string) {
    // TODO: Implement mark as unread
  }
}
