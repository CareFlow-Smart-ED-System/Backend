import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN || 'http://localhost:3001',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(client: Socket, payload: { userId: string }): void {
    if (!payload?.userId) {
      return;
    }

    client.join(`user_${payload.userId}`);
  }

  @SubscribeMessage('join_clinical_floor')
  handleJoinClinicalFloor(client: Socket): void {
    client.join('clinical_floor');
  }

  notifyUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  notifyClinicalFloor(notification: any) {
    this.server.to('clinical_floor').emit('notification', notification);
  }

  notifyQueueUpdated(caseId: string) {
    this.server.to('clinical_floor').emit('queue.updated', {
      caseId,
      action: 'REFETCH_QUEUE',
    });
  }

  notifyDoctorAssigned(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification.doctor_assigned', {
      ...notification,
      type: 'DOCTOR_ASSIGNED',
    });
  }

  notifyCriticalAlert(notification: any) {
    this.server.to('clinical_floor').emit('notification.critical_triage', {
      ...notification,
      type: 'CRITICAL_ALERT',
    });
  }

  notifyVitalsAbnormal(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.server.to(`user_${userId}`).emit('notification.vitals_abnormal', {
        ...notification,
        type: 'VITALS_ABNORMAL',
      });
    });
  }

  notifyNewPrescription(notification: any) {
    this.server.to('clinical_floor').emit('notification.new_prescription', {
      ...notification,
      type: 'NEW_PRESCRIPTION',
    });
  }

  notifyLabReady(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.server.to(`user_${userId}`).emit('notification.lab_ready', {
        ...notification,
        type: 'LAB_RESULT',
      });
    });
  }

  notifyImagingReady(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.server.to(`user_${userId}`).emit('notification.imaging_ready', {
        ...notification,
        type: 'IMAGING_READY',
      });
    });
  }
}
