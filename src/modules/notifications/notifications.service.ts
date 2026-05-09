import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common'
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,) {
     const skip = (page - 1) * limit;
    const where: any = { userId };
    if (isRead !== undefined) where.isRead = isRead;
    const [notifications, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return {
      total,
      unread,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: notifications.map((n) => ({
        id: n.id,
        caseId: n.caseId,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    }; 
  }

async markAsRead(notificationId: string, userId: string) {
  const notification = await this.prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) throw new NotFoundException('Notification not found');
  await this.prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return {
    message: 'Notification marked as read',
    notificationId,
  };
}

async markAllAsRead(userId: string) {
  const result = await this.prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return {
    message: 'All notifications marked as read',
    updatedCount: result.count,
  };
}

  async markAsUnread() {
    // TODO: Implement mark as unread logic
  }

  async createNotification() {
    // TODO: Implement create notification logic
  }
}
