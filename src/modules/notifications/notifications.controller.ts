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
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.sub);
  }
  
  @Patch(':notificationId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: any,
  ) {
    return this.notificationsService.markAsRead(notificationId, user.sub);
  }
}
