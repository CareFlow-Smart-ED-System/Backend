import { PrismaService } from '@/prisma/prisma.service';
import { PrescribeMedicationDto } from './dto/prescribe-medication.dto';
import { NotificationsService } from '@modules/notifications/notifications.service';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

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

  private async assertReadableCase(caseId: string, user: any) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: { caseDoctor: true },
    });

    if (!emergencyCase) {
      throw new NotFoundException('Case not found');
    }

    if (user.role === UserRole.DOCTOR) {
      const doctorId = await this.getDoctorId(user);
      const isAssigned = emergencyCase.caseDoctor.some(
        (cd) => cd.doctorId === doctorId,
      );
      if (!isAssigned) {
        throw new ForbiddenException('Doctor is not assigned to this case');
      }
    } else if (user.role === UserRole.NURSE) {
      const isActive =
        emergencyCase.status === 'WAITING' ||
        emergencyCase.status === 'UNDER_TREATMENT';
      if (!isActive) {
        throw new ForbiddenException('Can only view investigation results for active cases');
      }
    } else {
      throw new ForbiddenException('Unauthorized access to this case');
    }

    return emergencyCase;
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

  async getLabResults(caseId: string, user: any, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    await this.assertReadableCase(caseId, user);
    const prisma = this.prisma as any;
    const [results, total] = await Promise.all([
      prisma.labResult.findMany({ where: { caseId }, skip, take: limit }),
      prisma.labResult.count({ where: { caseId } }),
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
        status: r.status,
        ...(r.reportFileUrl ? { reportFileUrl: r.reportFileUrl } : {}),
        ...(r.reportFileName ? { reportFileName: r.reportFileName } : {}),
      })),
    };
  }

  async getImagingReports(caseId: string, user: any, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    await this.assertReadableCase(caseId, user);
    const prisma = this.prisma as any;
    const [reports, total] = await Promise.all([
      prisma.imagingReport.findMany({ where: { caseId }, skip, take: limit }),
      prisma.imagingReport.count({ where: { caseId } }),
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
        ...(r.region ? { region: r.region } : {}),
        report: r.report,
        date: r.date,
        status: r.status,
        ...(r.reportFileUrl ? { reportFileUrl: r.reportFileUrl } : {}),
        ...(r.reportFileName ? { reportFileName: r.reportFileName } : {}),
      })),
    };
  }

  async createLabOrder(caseId: string, user: any, dto: any) {
    await this.assertReadableCase(caseId, user);
    const doctorId = await this.getDoctorId(user);
    const prisma = this.prisma as any;

    const created = await prisma.labResult.create({
      data: {
        caseId,
        type: dto.type,
        result: '',
        notes: dto.notes ?? null,
        date: new Date(),
        status: 'PENDING',
        createdAt: new Date(),
      },
    });

    return {
      id: created.id,
      caseId: created.caseId,
      type: created.type,
      notes: created.notes,
      date: created.date,
      status: created.status,
    };
  }

  async createImagingOrder(caseId: string, user: any, dto: any) {
    await this.assertReadableCase(caseId, user);
    const doctorId = await this.getDoctorId(user);
    const prisma = this.prisma as any;

    const created = await prisma.imagingReport.create({
      data: {
        caseId,
        type: dto.type,
        region: dto.region ?? null,
        report: '',
        summary: dto.summary ?? null,
        date: new Date(),
        status: 'PENDING',
        createdAt: new Date(),
      },
    });

    return {
      id: created.id,
      caseId: created.caseId,
      type: created.type,
      region: created.region,
      summary: created.summary,
      date: created.date,
      status: created.status,
    };
  }

  private sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  async uploadLabReport(
    labResultId: string,
    user: any,
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException('reportFile is required');
    }

    const prisma = this.prisma as any;
    const labResult = await prisma.labResult.findUnique({
      where: { id: labResultId },
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    const reportFileName = this.sanitizeFileName(file.originalname);
    const reportFileUrl = `/uploads/lab-reports/${reportFileName}`;

    const updated = await prisma.labResult.update({
      where: { id: labResultId },
      data: {
        reportFileName,
        reportFileUrl,
        status: 'AVAILABLE',
        uploadedBy: user.sub,
        uploadedAt: new Date(),
      },
    });

    return {
      message: 'Lab report uploaded successfully',
      data: {
        id: updated.id,
        caseId: updated.caseId,
        reportFileUrl: updated.reportFileUrl,
        reportFileName: updated.reportFileName,
        uploadedBy: updated.uploadedBy,
        uploadedAt: updated.uploadedAt,
      },
    };
  }

  async uploadImagingReport(
    imagingId: string,
    user: any,
    file: any,
  ) {
    if (!file) {
      throw new BadRequestException('reportFile is required');
    }

    const prisma = this.prisma as any;
    const imagingReport = await prisma.imagingReport.findUnique({
      where: { id: imagingId },
    });

    if (!imagingReport) {
      throw new NotFoundException('Imaging report not found');
    }

    const reportFileName = this.sanitizeFileName(file.originalname);
    const reportFileUrl = `/uploads/imaging-reports/${reportFileName}`;

    const updated = await prisma.imagingReport.update({
      where: { id: imagingId },
      data: {
        reportFileName,
        reportFileUrl,
        status: 'AVAILABLE',
        reportedBy: user.sub,
        uploadedAt: new Date(),
      },
    });

    return {
      message: 'Imaging report uploaded successfully',
      data: {
        id: updated.id,
        caseId: updated.caseId,
        reportFileUrl: updated.reportFileUrl,
        reportFileName: updated.reportFileName,
        reportedBy: updated.reportedBy,
        uploadedAt: updated.uploadedAt,
      },
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
  async getMedications(
  caseId: string,
  user: any,
  page: number = 1,
  limit: number = 20,
) {
  const emergencyCase = await this.prisma.emergencyCase.findUnique({
    where: { id: caseId },
    include: { caseDoctor: true },
  });
  if (!emergencyCase) throw new NotFoundException('Case not found');

  if (user.role === 'DOCTOR') {
    const doctorId = await this.getDoctorId(user);
    const isAssigned = emergencyCase.caseDoctor.some(
      (cd) => cd.doctorId === doctorId,
    );
    if (!isAssigned) {
      throw new ForbiddenException('Doctor is not assigned to this case');
    }
  } else if (user.role === 'NURSE') {
    const isActive =
      emergencyCase.status === 'WAITING' ||
      emergencyCase.status === 'UNDER_TREATMENT';
    if (!isActive) {
      throw new ForbiddenException('Can only view medications for active cases');
    }
  }

  const skip = (page - 1) * limit;
  const [medications, total] = await Promise.all([
    this.prisma.medication.findMany({
      where: { caseId },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    }),
    this.prisma.medication.count({ where: { caseId } }),
  ]);

  return {
    caseId,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: medications.map((m) => ({
      id: m.id,
      caseId: m.caseId,
      name: m.name,
      dosage: m.dosage,
      prescribedBy: m.doctorId,
      createdAt: m.createdAt,
    })),
  };
}
}