import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CaseDoctorRole,
  CaseStatus,
  UserRole,
} from '@prisma/client';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async getDoctorByUserId(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor;
  }

  private async assertDoctorAssignedToCase(caseId: string, userId: string) {
    const doctor = await this.getDoctorByUserId(userId);
    const assignment = await this.prisma.caseDoctor.findFirst({
      where: { caseId, doctorId: doctor.id },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this case');
    }

    return { doctor, assignment };
  }

  private formatPatientName(patient: { firstName: string; lastName: string }) {
    return `${patient.firstName} ${patient.lastName}`.trim();
  }

  private normalizeStatusFilter(status?: CaseStatus) {
    if (status) {
      return status;
    }

    return { in: [CaseStatus.WAITING, CaseStatus.UNDER_TREATMENT] };
  }

  // 1. CREATE CASE
  async createCase(dto: CreateCaseDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const emergencyCase = await this.prisma.emergencyCase.create({
      data: {
        patientId: dto.patientId,
        status: CaseStatus.WAITING,
      },
    });

    await this.prisma.timelineEvent.create({
      data: {
        caseId: emergencyCase.id,
        type: 'CASE_CREATED',
        performedBy: 'System',
        details: 'Emergency case created with status WAITING',
      },
    });

    await this.notificationsService.notifyQueueUpdated(emergencyCase.id);

    return {
      message: 'Emergency case created successfully',
      caseId: emergencyCase.id,
      patientId: emergencyCase.patientId,
      status: emergencyCase.status,
      arrivalTime: emergencyCase.arrivalTime,
    };
  }

  // 2. GET ACTIVE CASES
  async getCases(
    currentUser: { sub: string; role: UserRole },
    status?: CaseStatus,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: this.normalizeStatusFilter(status),
    };

    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.getDoctorByUserId(currentUser.sub);
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
          patient: true,
          triage: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: cases.map((record) => {
        const triage = Array.isArray(record.triage) ? record.triage[0] : record.triage;
        return {
          caseId: record.id,
          patientId: record.patientId,
          patientName: this.formatPatientName(record.patient),
          status: record.status,
          severity: triage?.severity ?? null,
          arrivalTime: record.arrivalTime,
        };
      }),
    };
  }

  // 3. CASE DETAILS
  async getCaseById(
    caseId: string,
    currentUser: { sub: string; role: UserRole },
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: {
        patient: true,
        triage: true,
        caseDoctor: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (!emergencyCase) {
      throw new NotFoundException('Case not found');
    }

    if (currentUser.role === UserRole.DOCTOR) {
      await this.assertDoctorAssignedToCase(caseId, currentUser.sub);
    }

    const primaryDoctor =
      emergencyCase.caseDoctor.find((record) => record.role === CaseDoctorRole.PRIMARY) ??
      emergencyCase.caseDoctor[0];

    const triageRecord = Array.isArray(emergencyCase.triage)
      ? emergencyCase.triage[0]
      : emergencyCase.triage;

    return {
      caseId: emergencyCase.id,
      patientId: emergencyCase.patientId,
      patientName: this.formatPatientName(emergencyCase.patient),
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
      triage: triageRecord
        ? {
            severity: triageRecord.severity,
            triageTime: triageRecord.triageTime,
          }
        : null,
    };
  }

  // 4. TIMELINE
  async getCaseTimeline(caseId: string) {
    const exists = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });

    if (!exists) {
      throw new NotFoundException('Case not found');
    }

    const [timelineEvents, triage, vitalSigns, medications, notes] = await Promise.all([
      this.prisma.timelineEvent.findMany({
        where: { caseId },
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.triage.findFirst({
        where: { caseId },
        include: { nurse: { include: { user: true } } },
      }),
      this.prisma.vitalSigns.findMany({
        where: { caseId },
        orderBy: { timestamp: 'asc' },
        include: { nurse: { include: { user: true } } },
      }),
      this.prisma.medication.findMany({
        where: { caseId },
        orderBy: { createdAt: 'asc' },
        include: { doctor: { include: { user: true } } },
      }),
      this.prisma.nurseNote.findMany({
        where: { caseId },
        orderBy: { timestamp: 'asc' },
        include: { nurse: { include: { user: true } } },
      }),
    ]);

    const derivedEvents = [
      triage
        ? {
            type: 'TRIAGE',
            performedBy: triage.nurse?.user?.displayName ?? 'Nurse',
            details: `Severity classified as ${triage.severity}`,
            timestamp: triage.triageTime,
          }
        : null,
      ...vitalSigns.map((item) => ({
        type: 'VITAL_SIGNS',
        performedBy: item.nurse.user.displayName,
        details: [
          item.temperature !== null && item.temperature !== undefined
            ? `Temperature: ${item.temperature}`
            : null,
          item.systolic !== null && item.systolic !== undefined
            ? `BP: ${item.systolic}/${item.diastolic ?? '-'}`
            : null,
          item.heartRate !== null && item.heartRate !== undefined
            ? `Heart Rate: ${item.heartRate}`
            : null,
          item.oxygenSaturation !== null && item.oxygenSaturation !== undefined
            ? `O2 Sat: ${item.oxygenSaturation}`
            : null,
          item.respiratoryRate !== null && item.respiratoryRate !== undefined
            ? `Respiratory Rate: ${item.respiratoryRate}`
            : null,
        ]
          .filter(Boolean)
          .join(', '),
        timestamp: item.timestamp,
      })),
      ...medications.map((item) => ({
        type: 'MEDICATION',
        performedBy: item.doctor.user.displayName,
        details: `${item.name} prescribed`,
        timestamp: item.createdAt,
      })),
      ...notes.map((item) => ({
        type: 'NOTE',
        performedBy: item.nurse.user.displayName,
        details: item.note,
        timestamp: item.timestamp,
      })),
    ].filter(Boolean) as Array<{
      type: string;
      performedBy: string;
      details: string;
      timestamp: Date;
    }>;

    const allEvents = [
      ...timelineEvents.map((event) => ({
        type: event.type,
        performedBy: event.performedBy,
        details: event.details,
        timestamp: event.timestamp,
      })),
      ...derivedEvents,
    ].sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());

    return {
      caseId,
      total: allEvents.length,
      data: allEvents,
    };
  }

  // 5. UPDATE STATUS
  async updateCaseStatus(
    caseId: string,
    dto: UpdateCaseStatusDto,
    currentUser: { sub: string; role: UserRole },
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });

    if (!emergencyCase) {
      throw new NotFoundException('Case not found');
    }

    const actor = await this.getUserById(currentUser.sub);
    const current = emergencyCase.status;
    const next = dto.status;

    if (currentUser.role === UserRole.NURSE) {
      if (current !== CaseStatus.WAITING || next !== CaseStatus.UNDER_TREATMENT) {
        throw new ForbiddenException(
          'Nurses can only move cases from WAITING to UNDER_TREATMENT',
        );
      }
    } else if (currentUser.role === UserRole.DOCTOR) {
      if (current !== CaseStatus.UNDER_TREATMENT || next !== CaseStatus.COMPLETED) {
        throw new ForbiddenException(
          'Doctors can only move cases from UNDER_TREATMENT to COMPLETED',
        );
      }

      await this.assertDoctorAssignedToCase(caseId, currentUser.sub);
    } else {
      throw new ForbiddenException('Only doctors and nurses can update case status');
    }

    const updated = await this.prisma.emergencyCase.update({
      where: { id: caseId },
      data: { status: next },
    });

    await this.prisma.timelineEvent.create({
      data: {
        caseId,
        type: 'STATUS_CHANGE',
        performedBy: actor.displayName,
        details: `Status changed from ${current} to ${next}`,
      },
    });

    await this.notificationsService.notifyQueueUpdated(caseId);

    return {
      message: 'Case status updated successfully',
      caseId: updated.id,
      status: updated.status,
    };
  }

  // 6. DISCHARGE SUMMARY
  async getDischargeSummary(
    caseId: string,
    currentUser: { sub: string; role: UserRole },
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: {
        patient: true,
        medicalRecord: true,
        medications: {
          orderBy: { createdAt: 'asc' },
        },
        caseDoctor: true,
      },
    });

    if (!emergencyCase) {
      throw new NotFoundException('Case not found');
    }

    if (currentUser.role === UserRole.DOCTOR) {
      await this.assertDoctorAssignedToCase(caseId, currentUser.sub);
    }

    if (emergencyCase.status !== CaseStatus.COMPLETED) {
      throw new BadRequestException('Case is not completed yet');
    }

    return {
      caseId: emergencyCase.id,
      patientId: emergencyCase.patientId,
      patientName: this.formatPatientName(emergencyCase.patient),
      finalDiagnosis: emergencyCase.medicalRecord?.diagnosis ?? null,
      treatmentSummary: emergencyCase.medicalRecord?.notes ?? null,
      medications: emergencyCase.medications.map((medication) => ({
        name: medication.name,
        dosage: medication.dosage,
      })),
      dischargeRecommendation: null,
      dischargedAt: emergencyCase.updatedAt,
    };
  }

  // 6b. GET MEDICAL RECORDS FOR A CASE
  async getMedicalRecords(
    caseId: string,
    query: { page?: number; limit?: number },
    currentUser: { sub: string; role: UserRole },
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: { caseDoctor: true },
    });

    if (!emergencyCase) {
      throw new NotFoundException('Case not found');
    }

    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.getDoctorByUserId(currentUser.sub);
      const isAssigned = emergencyCase.caseDoctor.some(
        (cd) => cd.doctorId === doctor.id,
      );
      if (!isAssigned) {
        throw new ForbiddenException('Doctor is not authorized to view this case');
      }
    } else if (currentUser.role === UserRole.NURSE) {
      const isActive =
        emergencyCase.status === CaseStatus.WAITING ||
        emergencyCase.status === CaseStatus.UNDER_TREATMENT;
      if (!isActive) {
        throw new ForbiddenException('Can only view medical records for active cases');
      }
    }

    const [medicalRecords, totalRecords] = await Promise.all([
      this.prisma.medicalRecord.findMany({ where: { caseId }, skip, take: limit }),
      this.prisma.medicalRecord.count({ where: { caseId } }),
    ]);

    return {
      patientId: emergencyCase.patientId,
      total: totalRecords,
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit),
      data: medicalRecords.map((record) => ({
        recordId: record.id,
        caseId: record.caseId,
        diagnosis: record.diagnosis,
        notes: record.notes,
        chronicDiseases: record.chronicDiseases,
        familyHistory: record.familyHistory,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })),
    };
  }

  // 7. ASSIGN DOCTOR
//   async assignDoctor(
//     caseId: string,
//     dto: AssignDoctorDto,
//     currentUser: { sub: string; role: UserRole },
//   ) {
//     const emergencyCase = await this.prisma.emergencyCase.findUnique({
//       where: { id: caseId },
//     });

//     if (!emergencyCase) {
//       throw new NotFoundException('Case not found');
//     }

//     // if (currentUser.role === UserRole.DOCTOR) {
//     //   await this.assertDoctorAssignedToCase(caseId, currentUser.sub);
//     // } else if (currentUser.role !== UserRole.ADMIN) {
//     //   throw new ForbiddenException('Only admins and doctors can assign doctors');
//     // }

//     const doctor = await this.prisma.doctor.findUnique({
//       where: { id: dto.doctorId },
//       include: { user: true },
//     });

//     if (!doctor) {
//       throw new NotFoundException('Doctor not found');
//     }

//     const existing = await this.prisma.caseDoctor.findUnique({
//       where: { caseId_doctorId: { caseId, doctorId: dto.doctorId } },
//     });

//     if (existing) {
//       throw new ConflictException('Doctor already assigned to this case');
//     }

//     if (dto.role === CaseDoctorRole.PRIMARY) {
//       const existingPrimary = await this.prisma.caseDoctor.findFirst({
//         where: { caseId, role: CaseDoctorRole.PRIMARY },
//       });

//       if (existingPrimary) {
//         throw new ConflictException('Case already has a primary doctor');
//       }
//     }

//     await this.prisma.caseDoctor.create({
//       data: { caseId, doctorId: dto.doctorId, role: dto.role },
//     });

//     const actor = await this.getUserById(currentUser.sub);
//     await this.prisma.timelineEvent.create({
//       data: {
//         caseId,
//         type: 'DOCTOR_ASSIGNED',
//         performedBy: actor.displayName,
//         details: `Doctor assigned as ${dto.role}`,
//       },
//     });

//     return {
//       message: 'Doctor assigned to case successfully',
//       caseId,
//       doctorId: dto.doctorId,
//       role: dto.role,
//     };
//   }
// }
async assignDoctor(caseId: string, dto: AssignDoctorDto, currentUser: { sub: string; role: UserRole }) {
  const emergencyCase = await this.prisma.emergencyCase.findUnique({
    where: { id: caseId },
  });
  if (!emergencyCase) throw new NotFoundException('Case not found');

  const doctor = await this.prisma.doctor.findUnique({
    where: { id: dto.doctorId },
    include: { user: true },
  });
  if (!doctor) throw new NotFoundException('Doctor not found');

  const existing = await this.prisma.caseDoctor.findFirst({
    where: { caseId, doctorId: dto.doctorId },
  });
  if (existing) throw new BadRequestException('Doctor already assigned to this case');

  const assignment = await this.prisma.caseDoctor.create({
    data: {
      caseId,
      doctorId: dto.doctorId,
      role: dto.role,
    },
  });

  if (doctor?.user?.id) {
    await this.notificationsService.notifyDoctorAssigned(doctor.user.id, {
      caseId,
      message: 'You have been assigned to a patient',
      type: 'DOCTOR_ASSIGNED',
    });
  }

  return {
    message: 'Doctor assigned successfully',
    caseId,
    doctorId: dto.doctorId,
    role: assignment.role,
  };
}

async administerMedication(caseId: string, dto: any, currentUser: any) {
  // Verify case exists
  const emergencyCase = await this.prisma.emergencyCase.findUnique({
    where: { id: caseId },
  });
  if (!emergencyCase) throw new NotFoundException('Case not found');

  // Verify medication exists and belongs to case
  const medication = await this.prisma.medication.findUnique({
    where: { id: dto.medicationId },
  });
  if (!medication) throw new NotFoundException('Medication not found');
  if (medication.caseId !== caseId) throw new NotFoundException('Medication does not belong to this case');

  // Get nurse from current user
  const nurse = await this.prisma.nurse.findUnique({
    where: { userId: currentUser?.sub ?? currentUser?.id },
  });
  if (!nurse) throw new NotFoundException('Nurse profile not found');

  // Create medication administration record
  const administration = await this.prisma.medicationAdministration.create({
    data: {
      medicationId: dto.medicationId,
      administeredAt: new Date(),
    },
  });

  // Format the date as YYYY-MM-DD
  const administeredAtDate = administration.administeredAt.toISOString().split('T')[0];

  return {
    message: 'Medication administration recorded',
    data: {
      caseId: medication.caseId,
      medicationId: dto.medicationId,
      administeredBy: nurse.id,
      administeredAt: administeredAtDate,
    },
  };
}
}
