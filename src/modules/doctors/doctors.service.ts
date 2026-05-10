import { PrismaService } from '@/prisma/prisma.service';
import { PrescribeMedicationDto } from './dto/prescribe-medication.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async getDoctorId(user: any): Promise<string> {
    const profile = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { doctor: { select: { id: true } } },
    });
    if (!profile?.doctor?.id) throw new NotFoundException('Doctor profile not found');
    return profile.doctor.id;
  }

  async listDoctors(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        skip,
        take: limit,
        include: { user: true },
      }),
      this.prisma.doctor.count(),
    ]);
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: doctors.map((d) => ({
        doctorId: d.id,
        displayName: d.user.displayName,
        specialization: d.specialization,
      })),
    };
  }

  async getAssignedCases(user: any, page: number = 1, limit: number = 20, status?: string) {
    const doctorId = await this.getDoctorId(user);
    const skip = (page - 1) * limit;
    const where: any = { doctorId };
    if (status) where.case = { status };
    const [assignments, total] = await Promise.all([
      this.prisma.caseDoctor.findMany({
        where,
        skip,
        take: limit,
        include: {
          case: {
            include: {
              patient: { include: { user: true } },
              triage: true,
            },
          },
        },
        orderBy: [{ case: { arrivalTime: 'asc' } }],
      }),
      this.prisma.caseDoctor.count({ where }),
    ]);
    const severityScore = (s?: string) =>
      s === 'CRITICAL' ? 1 : s === 'URGENT' ? 2 : 3;
    return {
      doctorId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: assignments.map((a) => {
        const triage = Array.isArray(a.case.triage) ? a.case.triage[0] : a.case.triage;
        return {
          caseId: a.case.id,
          patientName: a.case.patient.user.displayName,
          patientId: a.case.patientId,
          severity: triage?.severity ?? null,
          priorityScore: severityScore(triage?.severity),
          status: a.case.status,
          arrivalTime: a.case.arrivalTime,
        };
      }),
    };
  }

  async getLabResults(caseId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const [results, total] = await Promise.all([
      this.prisma.labResult.findMany({ where: { caseId }, skip, take: limit }),
      this.prisma.labResult.count({ where: { caseId } }),
    ]);
    return {
      caseId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: results.map((r) => ({
        id: r.id,
        type: r.type,
        result: r.result,
        date: r.date,
        status: 'AVAILABLE',
      })),
    };
  }

  async getImagingReports(caseId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const [reports, total] = await Promise.all([
      this.prisma.imagingReport.findMany({ where: { caseId }, skip, take: limit }),
      this.prisma.imagingReport.count({ where: { caseId } }),
    ]);
    return {
      caseId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: reports.map((r) => ({
        id: r.id,
        type: r.type,
        report: r.report,
        date: r.date,
        status: 'AVAILABLE',
      })),
    };
  }

  async prescribeMedication(caseId: string, user: any, dto: PrescribeMedicationDto) {
    const doctorId = await this.getDoctorId(user);
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const medication = await this.prisma.medication.create({
      data: {
        caseId,
        doctorId,
        name: dto.name,
        dosage: dto.dosage,
      },
    });
    await this.notificationsService.notifyNewPrescription({
      caseId,
      message: 'New medication ordered for the case',
      medicationId: medication.id,
    });
    return {
      message: 'Medication prescribed successfully',
      medication: {
        id: medication.id,
        caseId: medication.caseId,
        name: medication.name,
        dosage: medication.dosage,
        prescribedBy: medication.doctorId,
      },
    };
  }
}