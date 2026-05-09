import { Injectable } from '@nestjs/common';
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

  /**
   * Quick patient registration for emergency arrivals
   * Creates a patient record with minimal information without a linked user account
   */
  async quickRegister(dto: QuickRegisterDto) {
    const { firstName, lastName, dateOfBirth, gender, phone } = dto;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const patient = await this.prisma.patient.create({
      data: {
        firstName,
        lastName,
        age,
        gender,
        phone,
      },
    });

    return {
      patientId: patient.id,
      firstName,
      lastName,
      age,
      gender,
      phone,
    };
  }

  /**
   * Link a user account to an existing patient profile
   * Generates a USER login account for an existing emergency patient
   */
  async linkAccount(patientId: string, linkAccountDto: LinkAccountDto) {
    const { email, password } = linkAccountDto;

    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { id: patientId },
      include: { user: true },
    });

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== patient.userId) {
      throw new Error('Email is already taken');
    }

    if (
      patient.user &&
      patient.user.email &&
      !patient.user.email.includes('@emergency.local')
    ) {
      throw new Error('Patient already has a linked user account');
    }

    const hashedPassword = await this.passwordService.hashPassword(password);

    let updatedUser;

    if (patient.user) {
      updatedUser = await this.prisma.user.update({
        where: { id: patient.userId },
        data: {
          email: email,
          passwordHash: hashedPassword,
        },
      });
    } else {
      updatedUser = await this.prisma.user.create({
        data: {
          name: 'Patient',
          email: email,
          passwordHash: hashedPassword,
          role: UserRole.PATIENT,
        },
      });

      await this.prisma.patient.update({
        where: { id: patientId },
        data: { userId: updatedUser.id },
      });
    }

    return {
      userId: updatedUser.id,
      patientId: patient.id,
      role: updatedUser.role,
    };
  }

  async getProfile(patientId: string, user: any) {
    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { id: patientId },
      include: {
        user: true,
        emergencyCases: {
          include: {
            doctors: true,
          },
        },
      },
    });

    if (user.role === UserRole.DOCTOR) {
      const caseAssigned = patient.emergencyCases.some((emergencyCase) =>
        emergencyCase.doctors?.some(
          (cd) => cd.doctorId === user.doctorId,
        ),
      );

      if (!caseAssigned) {
        throw new Error('Doctor is not authorized to view this patient');
      }
    } else if (user.role === UserRole.NURSE) {
      const hasActiveCase = patient.emergencyCases.some(
        (ec) => ec.status === CaseStatus.Active,
      );

      if (!hasActiveCase) {
        throw new Error('Patient does not have active cases');
      }
    }

    return {
      patientId: patient.id,
      displayName: patient.user?.name || 'N/A',
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
    };
  }

  async updateProfile(
  patientId: string,
  updatePatientDto: UpdatePatientDto,
) {
  const patient = await this.prisma.patient.findUniqueOrThrow({
    where: { id: patientId },
  });

  // calculate age from DOB
  const dob = new Date(updatePatientDto.dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  await this.prisma.patient.update({
    where: { id: patientId },
    data: {
      firstName: updatePatientDto.firstName,
      lastName: updatePatientDto.lastName,
      age: age,
      gender: updatePatientDto.gender,
      phone: updatePatientDto.phone,
    },
  });

  return {
    message: 'Patient profile updated successfully',
    patientId: patient.id,
  };
}

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
        patient: true,
        doctors: true,
      },
    });

    if (user.role === UserRole.DOCTOR) {
      const isAssigned = emergencyCase.doctors.some(
        (cd) => cd.doctorId === user.doctorId,
      );

      if (!isAssigned) {
        throw new Error('Doctor is not authorized to view this case');
      }
    } else if (user.role === UserRole.NURSE) {
      if (emergencyCase.status !== CaseStatus.Active) {
        throw new Error('Can only view medical records for active cases');
      }
    }

    const medicalRecords = await this.prisma.medicalRecord.findMany({
      where: { caseId: caseId },
      skip: skip,
      take: limit,
    });

    const totalRecords = await this.prisma.medicalRecord.count({
      where: { caseId: caseId },
    });

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      patientId: emergencyCase.patientId,
      total: totalRecords,
      page: page,
      limit: limit,
      totalPages: totalPages,
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
      include: { doctors: true },
    });

    const isAssigned = emergencyCase.doctors.some(
      (cd) => cd.doctorId === user.doctorId,
    );

    if (!isAssigned) {
      throw new Error('Doctor is not assigned to this case');
    }

    const existingRecord = await this.prisma.medicalRecord.findUnique({
      where: { caseId: caseId },
    });

    if (existingRecord) {
      throw new Error('Medical record already exists for this case');
    }

    const medicalRecord = await this.prisma.medicalRecord.create({
      data: {
        caseId: caseId,
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
      include: { doctors: true },
    });

    const isAssigned = emergencyCase.doctors.some(
      (cd) => cd.doctorId === user.doctorId,
    );

    if (!isAssigned) {
      throw new Error('Doctor is not assigned to this case');
    }

    const medicalRecord = await this.prisma.medicalRecord.findUniqueOrThrow({
      where: { id: recordId },
    });

    if (medicalRecord.caseId !== caseId) {
      throw new Error('Medical record does not belong to this case');
    }

    await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        diagnosis: updateMedicalRecordDto.diagnosis || medicalRecord.diagnosis,
        notes: updateMedicalRecordDto.notes || medicalRecord.notes,
        chronicDiseases:
          updateMedicalRecordDto.chronicDiseases ||
          medicalRecord.chronicDiseases,
        familyHistory:
          updateMedicalRecordDto.familyHistory ||
          medicalRecord.familyHistory,
      },
    });
  }
}