import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, UserRole } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

type CreateNotificationInput = {
  userId: string;
  caseId?: string | null;
  message: string;
  type: NotificationType;
  isRead?: boolean;
  readAt?: Date | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  private async createNotificationsForUsers(
    userIds: string[],
    input: Omit<CreateNotificationInput, 'userId'>,
  ) {
    return Promise.all(
      userIds.map((userId) =>
        this.createNotification({
          userId,
          caseId: input.caseId,
          message: input.message,
          type: input.type,
          isRead: input.isRead,
          readAt: input.readAt,
        }),
      ),
    );
  }

  private async getUserIdsByRole(role: UserRole) {
    const users = await this.prisma.user.findMany({
      where: { role },
      select: { id: true },
    });
    return users.map((user) => user.id);
  }

  private async getAssignedDoctorUserIds(caseId: string) {
    const assignments = await this.prisma.caseDoctor.findMany({
      where: { caseId },
      include: { doctor: { include: { user: true } } },
    });

    return assignments
      .map((assignment) => assignment.doctor.user.id)
      .filter((userId): userId is string => Boolean(userId));
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
  ) {
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
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
    return {
      message: 'Notification marked as read',
      notificationId,
    };
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return {
      message: 'All notifications marked as read',
      updatedCount: result.count,
    };
  }

  async createNotification(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        caseId: input.caseId ?? null,
        message: input.message,
        type: input.type,
        isRead: input.isRead ?? false,
        readAt: input.readAt ?? null,
      },
    });

    this.notificationsGateway.notifyUser(input.userId, {
      notificationId: notification.id,
      caseId: notification.caseId,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async createUserNotification(input: {
    userId: string;
    caseId?: string | null;
    message: string;
    type: NotificationType;
  }) {
    return this.createNotification(input);
  }

  async notifyQueueUpdated(caseId: string) {
    this.notificationsGateway.notifyQueueUpdated(caseId);
  }

  async notifyDoctorAssigned(userId: string, payload: any) {
    await this.createNotification({
      userId,
      caseId: payload.caseId ?? null,
      message: payload.message,
      type: NotificationType.DOCTOR_ASSIGNED,
    });

    this.notificationsGateway.notifyDoctorAssigned(userId, payload);
  }

  async notifyCriticalAlert(payload: any) {
    const doctorUserIds = await this.getUserIdsByRole(UserRole.DOCTOR);

    if (doctorUserIds.length > 0) {
      await this.createNotificationsForUsers(doctorUserIds, {
        caseId: payload.caseId ?? null,
        message: payload.message,
        type: NotificationType.CRITICAL_ALERT,
      });
    }

    this.notificationsGateway.notifyCriticalAlert(payload);
  }

  async notifyVitalsAbnormal(userIds: string[], payload: any) {
    await this.createNotificationsForUsers(userIds, {
      caseId: payload.caseId ?? null,
      message: payload.message,
      type: NotificationType.VITALS_ABNORMAL,
    });

    this.notificationsGateway.notifyVitalsAbnormal(userIds, payload);
  }

  async notifyNewPrescription(payload: any) {
    const nurseUserIds = await this.getUserIdsByRole(UserRole.NURSE);

    if (nurseUserIds.length > 0) {
      await this.createNotificationsForUsers(nurseUserIds, {
        caseId: payload.caseId ?? null,
        message: payload.message,
        type: NotificationType.NEW_PRESCRIPTION,
      });
    }

    this.notificationsGateway.notifyNewPrescription(payload);
  }

  async notifyLabReady(userIds: string[], payload: any) {
    await this.createNotificationsForUsers(userIds, {
      caseId: payload.caseId ?? null,
      message: payload.message,
      type: NotificationType.LAB_RESULT,
    });

    this.notificationsGateway.notifyLabReady(userIds, payload);
  }

  async notifyImagingReady(userIds: string[], payload: any) {
    // create DB notification records for each user and emit via gateway
    await this.createNotificationsForUsers(userIds, {
      caseId: payload.caseId ?? null,
      message: payload.message,
      type: NotificationType.IMAGING_READY,
    });

    this.notificationsGateway.notifyImagingReady(userIds, payload);
  }

  async getAssignedDoctorNotificationTargets(caseId: string) {
    return this.getAssignedDoctorUserIds(caseId);
  }
}
