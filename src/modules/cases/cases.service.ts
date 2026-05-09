import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service'; // adjust path to yours
import { CaseStatus, UserRole } from '@prisma/client';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  // ── 1. CREATE CASE ──────────────────────────────────────────────────────────
  async createCase(dto: CreateCaseDto) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const emergencyCase = await this.prisma.emergencyCase.create({
      data: {
        patientId: dto.patientId,
        status: CaseStatus.WAITING,
      },
    });

    // Write audit log
    await this.prisma.timelineEvent.create({
      data: {
        caseId: emergencyCase.id,
        type: 'STATUS_CHANGE',
        performedBy: 'System',
        details: 'Emergency case created with status WAITING',
      },
    });

    return {
      message: 'Emergency case created successfully',
      caseId: emergencyCase.id,
      patientId: emergencyCase.patientId,
      status: emergencyCase.status,
      arrivalTime: emergencyCase.arrivalTime,
    };
  }

  // ── 2. GET ALL ACTIVE CASES ─────────────────────────────────────────────────
  async getCases(
    currentUser: { id: string; role: UserRole },
    status?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    // Base where clause
    const where: any = {};
    if (status) where.status = status;

    // Doctors only see their assigned cases
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!doctor) throw new NotFoundException('Doctor profile not found');

      where.caseDoctor = { some: { doctorId: doctor.id } };
    }

    const [total, cases] = await Promise.all([
      this.prisma.emergencyCase.count({ where }),
      this.prisma.emergencyCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { arrivalTime: 'asc' },
        include: {
          patient: { include: { user: true } },
          triage: true,
          caseDoctor: { include: { doctor: { include: { user: true } } } },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: cases.map((c) => ({
        caseId: c.id,
        patientId: c.patientId,
        patientName: `${c.patient.firstName} ${c.patient.lastName}`,
        status: c.status,
        severity: c.triage?.severity ?? null,
        arrivalTime: c.arrivalTime,
      })),
    };
  }

  // ── 3. GET CASE DETAILS ─────────────────────────────────────────────────────
  async getCaseById(
    caseId: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: {
        patient: { include: { user: true } },
        triage: true,
        caseDoctor: {
          include: { doctor: { include: { user: true } } },
        },
      },
    });

    if (!emergencyCase) throw new NotFoundException('Case not found');

    // Doctors can only view cases they are assigned to
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      const isAssigned = emergencyCase.caseDoctor.some(
        (cd) => cd.doctorId === doctor?.id,
      );
      if (!isAssigned) throw new ForbiddenException('Access denied');
    }

    const primaryDoctor = emergencyCase.caseDoctor.find(
      (cd) => cd.role === 'PRIMARY',
    );

    return {
      caseId: emergencyCase.id,
      patientId: emergencyCase.patientId,
      patientName: `${emergencyCase.patient.firstName} ${emergencyCase.patient.lastName}`,
      status: emergencyCase.status,
      arrivalTime: emergencyCase.arrivalTime,
      assignedDoctor: primaryDoctor
        ? {
            doctorId: primaryDoctor.doctorId,
            name: primaryDoctor.doctor.user.displayName,
            specialization: primaryDoctor.doctor.specialization,
            role: primaryDoctor.role,
          }
        : null,
      triage: emergencyCase.triage
        ? {
            severity: emergencyCase.triage.severity,
            triageTime: emergencyCase.triage.triageTime,
          }
        : null,
    };
  }

  // ── 4. GET CASE TIMELINE ────────────────────────────────────────────────────
  async getCaseTimeline(caseId: string) {
    const exists = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });
    if (!exists) throw new NotFoundException('Case not found');

    const events = await this.prisma.timelineEvent.findMany({
      where: { caseId },
      orderBy: { timestamp: 'asc' },
    });

    return {
      caseId,
      total: events.length,
      data: events.map((e) => ({
        type: e.type,
        performedBy: e.performedBy,
        details: e.details,
        timestamp: e.timestamp,
      })),
    };
  }

  // ── 5. UPDATE CASE STATUS ───────────────────────────────────────────────────
  async updateCaseStatus(
    caseId: string,
    dto: UpdateCaseStatusDto,
    currentUser: { id: string; role: UserRole; displayName: string },
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    const current = emergencyCase.status;
    const next = dto.status;

    // Enforce transition rules per role
    if (currentUser.role === UserRole.NURSE) {
      // Nurses: WAITING -> UNDER_TREATMENT only
      if (current !== CaseStatus.WAITING || next !== CaseStatus.UNDER_TREATMENT) {
        throw new ForbiddenException(
          'Nurses can only move cases from WAITING to UNDER_TREATMENT',
        );
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      // Doctors: UNDER_TREATMENT -> COMPLETED only
      if (current !== CaseStatus.UNDER_TREATMENT || next !== CaseStatus.COMPLETED) {
        throw new ForbiddenException(
          'Doctors can only move cases from UNDER_TREATMENT to COMPLETED',
        );
      }
      // Also verify doctor is assigned to this case
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      const assignment = await this.prisma.caseDoctor.findFirst({
        where: { caseId, doctorId: doctor?.id },
      });
      if (!assignment) throw new ForbiddenException('You are not assigned to this case');
    }

    const updated = await this.prisma.emergencyCase.update({
      where: { id: caseId },
      data: { status: next },
    });

    // Record in timeline
    await this.prisma.timelineEvent.create({
      data: {
        caseId,
        type: 'STATUS_CHANGE',
        performedBy: currentUser.displayName,
        details: `Status changed from ${current} to ${next}`,
      },
    });

    return {
      message: 'Case status updated successfully',
      caseId: updated.id,
      status: updated.status,
    };
  }

  // ── 6. GET DISCHARGE SUMMARY ────────────────────────────────────────────────
  async getDischargeSummary(caseId: string) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: {
        patient: true,
        medicalRecord: true,
        medications: true,
      },
    });

    if (!emergencyCase) throw new NotFoundException('Case not found');

    if (emergencyCase.status !== CaseStatus.COMPLETED) {
      throw new BadRequestException('Case is not completed yet');
    }

    return {
      caseId: emergencyCase.id,
      patientId: emergencyCase.patientId,
      patientName: `${emergencyCase.patient.firstName} ${emergencyCase.patient.lastName}`,
      finalDiagnosis: emergencyCase.medicalRecord?.diagnosis ?? null,
      treatmentSummary: emergencyCase.medicalRecord?.notes ?? null,
      medications: emergencyCase.medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
      })),
      dischargeRecommendation: null, // extend MedicalRecord if needed
      dischargedAt: emergencyCase.updatedAt,
    };
  }

  // ── 7. ASSIGN DOCTOR ────────────────────────────────────────────────────────
  async assignDoctor(
    caseId: string,
    dto: AssignDoctorDto,
    currentUser: { id: string; displayName: string },
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Prevent duplicate assignment
    const existing = await this.prisma.caseDoctor.findUnique({
      where: { caseId_doctorId: { caseId, doctorId: dto.doctorId } },
    });
    if (existing) throw new ConflictException('Doctor already assigned to this case');

    await this.prisma.caseDoctor.create({
      data: { caseId, doctorId: dto.doctorId, role: dto.role },
    });

    // Record in timeline
    await this.prisma.timelineEvent.create({
      data: {
        caseId,
        type: 'DOCTOR_ASSIGNED',
        performedBy: currentUser.displayName,
        details: `Dr. assigned as ${dto.role}`,
      },
    });

    return {
      message: 'Doctor assigned to case successfully',
      caseId,
      doctorId: dto.doctorId,
      role: dto.role,
    };
  }
}