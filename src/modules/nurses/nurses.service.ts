import { PrismaService } from '@/prisma/prisma.service';
import { CreateVitalSignsDto } from './dto/create-vital-signs.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class NursesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async resolveNurseId(actorId: string): Promise<string> {
    if (!actorId) {
      throw new UnauthorizedException('Authenticated user id is missing from token');
    }

    const byNurseId = await this.prisma.nurse.findUnique({
      where: { id: actorId },
      select: { id: true },
    });
    if (byNurseId) return byNurseId.id;

    const byUserId = await this.prisma.nurse.findUnique({
      where: { userId: actorId },
      select: { id: true },
    });
    if (byUserId) return byUserId.id;

    throw new NotFoundException('Nurse profile not found for current user');
  }

  private isVitalsAbnormal(dto: CreateVitalSignsDto) {
    const temperature = dto.temperature;
    const systolic = dto.systolic;
    const diastolic = dto.diastolic;
    const heartRate = dto.heartRate;
    const oxygenSaturation = dto.oxygenSaturation;
    const respiratoryRate = dto.respiratoryRate;

    return (
      (temperature !== undefined && temperature !== null && (temperature < 36 || temperature > 38)) ||
      (systolic !== undefined && systolic !== null && (systolic < 90 || systolic > 140)) ||
      (diastolic !== undefined && diastolic !== null && (diastolic < 60 || diastolic > 90)) ||
      (heartRate !== undefined && heartRate !== null && (heartRate < 60 || heartRate > 100)) ||
      (oxygenSaturation !== undefined && oxygenSaturation !== null && oxygenSaturation < 95) ||
      (respiratoryRate !== undefined && respiratoryRate !== null && (respiratoryRate < 12 || respiratoryRate > 20))
    );
  }

  async createVitalSigns(caseId: string, actorId: string, dto: CreateVitalSignsDto) {
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const nurseId = await this.resolveNurseId(actorId);
    const record = await this.prisma.vitalSigns.create({
      data: {
        case: { connect: { id: caseId } },
        nurse: { connect: { id: nurseId } },
        temperature: dto.temperature,
        systolic: dto.systolic,
        diastolic: dto.diastolic,
        heartRate: dto.heartRate,
        oxygenSaturation: dto.oxygenSaturation,
        respiratoryRate: dto.respiratoryRate,
      },
    });

    if (this.isVitalsAbnormal(dto)) {
      const assignedDoctors = await this.prisma.caseDoctor.findMany({
        where: { caseId },
        include: { doctor: { include: { user: true } } },
      });
      const doctorUserIds = assignedDoctors
        .map((assignment) => assignment.doctor.user.id)
        .filter((userId): userId is string => Boolean(userId));

      if (doctorUserIds.length > 0) {
        await this.notificationsService.notifyVitalsAbnormal(doctorUserIds, {
          caseId,
          message: 'Abnormal vitals recorded for the case',
        });
      }
    }

    

    return {
      message: 'Vital signs recorded successfully',
      id: record.id,
      caseId: record.caseId,
      temperature: record.temperature,
      systolic: record.systolic,
      diastolic: record.diastolic,
      heartRate: record.heartRate,
      oxygenSaturation: record.oxygenSaturation,
      respiratoryRate: record.respiratoryRate,
      recordedBy: record.nurseId,
      timestamp: record.timestamp,
    };
  }

  async getVitalSigns(caseId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const [records, total] = await Promise.all([
      this.prisma.vitalSigns.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.vitalSigns.count({ where: { caseId } }),
    ]);
    return {
      caseId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: records.map((r) => ({       // ← here, inside the return
        id: r.id,
        temperature: r.temperature,
        systolic: r.systolic,
        diastolic: r.diastolic,
        heartRate: r.heartRate,
        oxygenSaturation: r.oxygenSaturation,
        respiratoryRate: r.respiratoryRate,
        nurseId: r.nurseId,
        timestamp: r.timestamp,
      })),
    };
  }

  async administerMedication(caseId: string, actorId: string, dto: AdministerMedicationDto) {
    const medication = await this.prisma.medication.findUnique({
      where: { id: dto.medicationId },
    });
    if (!medication) throw new NotFoundException('Medication not found');
    const nurseId = await this.resolveNurseId(actorId);
    return {
      message: 'Medication administration recorded',
      data: {
        caseId,
        medicationId: dto.medicationId,
        administeredBy: nurseId,
        administeredAt: new Date(),
      },
    };
  }
  

  async createClinicalNote(caseId: string, actorId: string, dto: CreateNoteDto) {
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const nurseId = await this.resolveNurseId(actorId);
    const note = await this.prisma.nurseNote.create({
      data: {
        case: { connect: { id: caseId } },
        nurse: { connect: { id: nurseId } },
        note: dto.note,
      },
    });
    return {
      message: 'Note added successfully',
      data: {
        id: note.id,
        caseId: note.caseId,
        nurseId: note.nurseId,
        note: note.note,
        timestamp: note.timestamp,
      },
    };
  }

  async getClinicalNotes(caseId: string,page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    
    const [notes, total] = await Promise.all([
      this.prisma.nurseNote.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.nurseNote.count({ where: { caseId } }),
    ]);
    return {
      caseId,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: notes.map((n) => ({
        id: n.id,
        nurseId: n.nurseId,
        note: n.note,
        timestamp: n.timestamp,
      })),
    };
  }
}
