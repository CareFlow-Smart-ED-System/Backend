import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentStatus, UserRole } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  // ── 1. BOOK APPOINTMENT ───────────────────────────────────────────────────
  async createAppointment(dto: CreateAppointmentDto) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Prevent booking in the past
    const appointmentDate = new Date(dto.date);
    if (appointmentDate < new Date()) {
      throw new BadRequestException('Appointment date cannot be in the past');
    }

    // Check for duplicate appointment (same doctor, same patient, same date)
    const existing = await this.prisma.appointment.findFirst({
      where: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        date: appointmentDate,
        status: AppointmentStatus.SCHEDULED,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'An appointment already exists for this patient with this doctor at the same date',
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        date: appointmentDate,
        status: dto.status ?? AppointmentStatus.SCHEDULED,
      },
    });

    return {
      message: 'Appointment booked successfully',
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      status: appointment.status,
    };
  }

  // ── 2. LIST APPOINTMENTS ──────────────────────────────────────────────────
  async getAppointments(
    currentUser: { id: string; role: UserRole },
    status?: AppointmentStatus,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter by status if provided
    if (status) where.status = status;

    // Doctors only see their own appointments
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!doctor) throw new NotFoundException('Doctor profile not found');
      where.doctorId = doctor.id;
    }

    const [total, appointments] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: appointments.map((a) => ({
        appointmentId: a.id,
        patientName: `${a.patient.firstName} ${a.patient.lastName}`,
        doctorName: a.doctor.user.displayName,
        date: a.date,
        status: a.status,
      })),
    };
  }

  // ── 3. UPDATE APPOINTMENT ─────────────────────────────────────────────────
  async updateAppointment(appointmentId: string, dto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Cannot update a completed appointment
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed appointment');
    }

    // Cannot cancel an already cancelled appointment
    if (
      appointment.status === AppointmentStatus.CANCELLED &&
      dto.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: dto.status },
    });

    return {
      message: 'Appointment updated successfully',
      appointmentId: updated.id,
      status: updated.status,
    };
  }
}