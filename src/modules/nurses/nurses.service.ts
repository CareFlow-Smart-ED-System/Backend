import { PrismaService } from '@/prisma/prisma.service';
import { CreateVitalSignsDto } from './dto/create-vital-signs.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class NursesService {
  constructor(private prisma: PrismaService) {}

  async createVitalSigns(caseId: string, nurseId: string, dto: CreateVitalSignsDto) {
    const exists = await this.prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!exists) throw new NotFoundException('Case not found');
    const record = await this.prisma.vitalSigns.create({
    data: {
      caseId,                              // string — no parseInt
      nurseId,                             // string — no parseInt
      temperature: dto.temperature,
      systolic: dto.systolic,              // direct field
      diastolic: dto.diastolic,            // direct field
      heartRate: dto.heartRate,
      oxygenSaturation: dto.oxygenSaturation,
      respiratoryRate: dto.respiratoryRate,
    },
  });

    

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

  async administerMedication() {
    // TODO: Implement administer medication logic
  }

  async createClinicalNote() {
    // TODO: Implement create clinical note logic
  }

  async getClinicalNotes() {
    // TODO: Implement get clinical notes logic
  }
}
