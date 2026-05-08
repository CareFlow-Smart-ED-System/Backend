import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async bookAppointment() {
    // TODO: Implement book appointment logic
  }

  async listAppointments() {
    // TODO: Implement list appointments logic
  }

  async updateAppointment() {
    // TODO: Implement update appointment logic
  }
}
