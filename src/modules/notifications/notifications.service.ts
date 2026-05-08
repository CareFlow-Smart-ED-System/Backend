import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications() {
    // TODO: Implement get notifications logic
  }

  async markAsRead() {
    // TODO: Implement mark as read logic
  }

  async markAsUnread() {
    // TODO: Implement mark as unread logic
  }

  async createNotification() {
    // TODO: Implement create notification logic
  }
}
