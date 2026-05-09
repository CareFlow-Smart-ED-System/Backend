import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PasswordService } from '@common/password.service';
import { UserRole, CaseStatus } from '@prisma/client';
import {
  QuickRegisterDto,
  LinkAccountDto,
  UpdatePatientDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  GetMedicalRecordsQueryDto,
} from './dto';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  // ─── Quick Register ────────────────────────────────────────────────────────
  // Creates a placeholder User + Patient for emergency arrivals.
  // A random @emergency.local email is used so linkAccount can detect it later.

  async quickRegister(dto: QuickRegisterDto) {
    const { firstName, lastName, dateOfBirth, gender, phone } = dto;

    const displayName = `${firstName} ${lastName}`;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const placeholderEmail = `emergency-${crypto.randomUUID()}@emergency.local`;
    const placeholderHash = await this.passwordService.hashPassword(crypto.randomUUID());

    const user = await this.prisma.user.create({
      data: {
        displayName,
        dateOfBirth: dob,
        gender,
        email: placeholderEmail,
        passwordHash: placeholderHash,
        role: UserRole.PATIENT,
      },
    });

    const patient = await this.prisma.patient.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
      },
    });

    return {
      patientId: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      displayName,
      age,
      gender,
      phone,
    };
  }

  // ─── Link Account ──────────────────────────────────────────────────────────

  async linkAccount(patientId: string, linkAccountDto: LinkAccountDto) {
    const { email, password } = linkAccountDto;

    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { id: patientId },
      include: { user: true },
    });

    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.id !== patient.userId) {
      throw new BadRequestException('Email is already taken');
    }

    if (
      patient.user.email &&
      !patient.user.email.includes('@emergency.local')
    ) {
      throw new BadRequestException('Patient already has a linked user account');
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    const updatedUser = await this.prisma.user.update({
      where: { id: patient.userId },
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    return {
      userId: updatedUser.id,
      patientId: patient.id,
      role: updatedUser.role,
    };
  }

  // ─── Get Profile ───────────────────────────────────────────────────────────

  async getProfile(patientId: string, user: any) {
    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { id: patientId },
      include: {
        user: true,
        emergencyCases: {
          include: {
            caseDoctor: true,  // ← correct relation name from schema
          },
        },
      },
    });

    if (user.role === UserRole.DOCTOR) {
      const caseAssigned = patient.emergencyCases.some((ec) =>
        ec.caseDoctor.some((cd) => cd.doctorId === user.doctorId),
      );

      if (!caseAssigned) {
        throw new ForbiddenException('Doctor is not authorized to view this patient');
      }
    } else if (user.role === UserRole.NURSE) {
      // Active = WAITING or UNDER_TREATMENT (not yet COMPLETED)
      const hasActiveCase = patient.emergencyCases.some(
        (ec) =>
          ec.status === CaseStatus.WAITING ||
          ec.status === CaseStatus.UNDER_TREATMENT,
      );

      if (!hasActiveCase) {
        throw new ForbiddenException('Patient does not have active cases');
      }
    }

    // Calculate age from dateOfBirth stored on User
    let age: number | null = null;
    if (patient.user.dateOfBirth) {
      const dob = patient.user.dateOfBirth;
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    }

    return {
      patientId: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      displayName: patient.user.displayName,
      age,
      gender: patient.user.gender,
      phone: patient.phone,
    };
  }

  // ─── Update Profile ────────────────────────────────────────────────────────
  // firstName/lastName/phone live on Patient; dateOfBirth/gender live on User.

  async updateProfile(patientId: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { id: patientId },
    });

    const dob = new Date(updatePatientDto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    await this.prisma.user.update({
      where: { id: patient.userId },
      data: {
        dateOfBirth: dob,
        gender: updatePatientDto.gender,
      },
    });

    await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        firstName: updatePatientDto.firstName,
        lastName: updatePatientDto.lastName,
        phone: updatePatientDto.phone,
      },
    });

    return {
      message: 'Patient profile updated successfully',
      patientId: patient.id,
    };
  }

  // ─── Medical Records ───────────────────────────────────────────────────────

  async getMedicalRecords(
    caseId: string,
    queryDto: GetMedicalRecordsQueryDto,
    user: any,
  ) {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const emergencyCase = await this.prisma.emergencyCase.findUniqueOrThrow({
      where: { id: caseId },
      include: {
        caseDoctor: true,  // ← correct relation name
      },
    });

    if (user.role === UserRole.DOCTOR) {
      const isAssigned = emergencyCase.caseDoctor.some(
        (cd) => cd.doctorId === user.doctorId,
      );
      if (!isAssigned) {
        throw new ForbiddenException('Doctor is not authorized to view this case');
      }
    } else if (user.role === UserRole.NURSE) {
      const isActive =
        emergencyCase.status === CaseStatus.WAITING ||
        emergencyCase.status === CaseStatus.UNDER_TREATMENT;
      if (!isActive) {
        throw new ForbiddenException('Can only view medical records for active cases');
      }
    }

    const [medicalRecords, totalRecords] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: { caseId },
        skip,
        take: limit,
      }),
      this.prisma.medicalRecord.count({ where: { caseId } }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      patientId: emergencyCase.patientId,
      total: totalRecords,
      page,
      limit,
      totalPages,
      data: medicalRecords.map((record) => ({
        recordId: record.id,
        caseId: record.caseId,
        diagnosis: record.diagnosis,
        notes: record.notes,
        chronicDiseases: record.chronicDiseases,
        familyHistory: record.familyHistory,
      })),
    };
  }

  async createMedicalRecord(
    caseId: string,
    createMedicalRecordDto: CreateMedicalRecordDto,
    user: any,
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUniqueOrThrow({
      where: { id: caseId },
      include: { caseDoctor: true },
    });

    const isAssigned = emergencyCase.caseDoctor.some(
      (cd) => cd.doctorId === user.doctorId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Doctor is not assigned to this case');
    }

    const existingRecord = await this.prisma.medicalRecord.findUnique({
      where: { caseId },
    });

    if (existingRecord) {
      throw new BadRequestException('Medical record already exists for this case');
    }

    const medicalRecord = await this.prisma.medicalRecord.create({
      data: {
        caseId,
        diagnosis: createMedicalRecordDto.diagnosis,
        notes: createMedicalRecordDto.notes,
        chronicDiseases: createMedicalRecordDto.chronicDiseases,
        familyHistory: createMedicalRecordDto.familyHistory,
      },
    });

    return {
      recordId: medicalRecord.id,
      patientId: emergencyCase.patientId,
      caseId: medicalRecord.caseId,
    };
  }

  async updateMedicalRecord(
    caseId: string,
    recordId: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    user: any,
  ) {
    const emergencyCase = await this.prisma.emergencyCase.findUniqueOrThrow({
      where: { id: caseId },
      include: { caseDoctor: true },
    });

    const isAssigned = emergencyCase.caseDoctor.some(
      (cd) => cd.doctorId === user.doctorId,
    );

    if (!isAssigned) {
      throw new ForbiddenException('Doctor is not assigned to this case');
    }

    const medicalRecord = await this.prisma.medicalRecord.findUniqueOrThrow({
      where: { id: recordId },
    });

    if (medicalRecord.caseId !== caseId) {
      throw new BadRequestException('Medical record does not belong to this case');
    }

    await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        diagnosis: updateMedicalRecordDto.diagnosis ?? medicalRecord.diagnosis,
        notes: updateMedicalRecordDto.notes ?? medicalRecord.notes,
        chronicDiseases:
          updateMedicalRecordDto.chronicDiseases ?? medicalRecord.chronicDiseases,
        familyHistory:
          updateMedicalRecordDto.familyHistory ?? medicalRecord.familyHistory,
      },
    });
  }
}