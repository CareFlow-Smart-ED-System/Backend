import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UserRole, TriageSeverity, NotificationType } from '@prisma/client';
import { CreateTriageDto } from './dto/create-triage.dto';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class TriageService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ── 1. CREATE TRIAGE ──────────────────────────────────────────────────────
  async createTriage(
    caseId: string,
    dto: CreateTriageDto,
    currentUser: { id?: string; sub?: string; displayName?: string; role: UserRole },
  ) {
    // Verify case exists and is not completed
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
      include: { patient: { include: { user: true } } },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    // Get nurse profile from the logged-in user
    const nurseUserId = currentUser.id ?? currentUser.sub;
    const nurse = await this.prisma.nurse.findUnique({
    where: { userId: nurseUserId },
    include: { user: { select: { displayName: true } } },
    });
    if (!nurse) throw new ForbiddenException('Nurse profile not found');

    // Create triage record (immutable — never updated, only new records added)
    const triage = await this.prisma.triage.create({
      data: {
        caseId,
        nurseId: nurse.id,
        severity: dto.severity,
        temperature: dto.temperature,
        systolic: dto.systolic,
        diastolic: dto.diastolic,
        heartRate: dto.heartRate,
        oxygenSaturation: dto.oxygenSaturation,
        respiratoryRate: dto.respiratoryRate,
      },
    });

    // Record in timeline
    await this.prisma.timelineEvent.create({
      data: {
        caseId,
        type: 'TRIAGE',
        performedBy: currentUser.displayName ?? 'Nurse',
        details: `Severity classified as ${dto.severity}`,
      },
    });

    await this.notificationsService.notifyQueueUpdated(caseId);

    // If CRITICAL — notify all assigned doctors immediately
    if (dto.severity === TriageSeverity.CRITICAL) {
      await this.notificationsService.notifyCriticalAlert({
        caseId,
        message: `CRITICAL PATIENT ARRIVED: ${emergencyCase.patient.user.displayName}`,
      });
    }

    return {
      message: 'Triage recorded successfully',
      triageId: triage.id,
      caseId: triage.caseId,
      severity: triage.severity,
      triageTime: triage.triageTime,
    };
  }

  // ── 2. GET LATEST TRIAGE ──────────────────────────────────────────────────
  async getLatestTriage(caseId: string) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    // Return the most recent triage record
    const triage = await this.prisma.triage.findFirst({
      where: { caseId },
      orderBy: { triageTime: 'desc' },
    });

    if (!triage) throw new NotFoundException('Triage record not found for this case');

    return {
      triageId: triage.id,
      caseId: triage.caseId,
      severity: triage.severity,
      temperature: triage.temperature,
      systolic: triage.systolic,
      diastolic: triage.diastolic,
      heartRate: triage.heartRate,
      oxygenSaturation: triage.oxygenSaturation,
      respiratoryRate: triage.respiratoryRate,
      nurseId: triage.nurseId,
      triageTime: triage.triageTime,
    };
  }

  // ── 3. GET TRIAGE HISTORY ─────────────────────────────────────────────────
  async getTriageHistory(caseId: string, page = 1, limit = 20) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      this.prisma.triage.count({ where: { caseId } }),
      this.prisma.triage.findMany({
        where: { caseId },
        orderBy: { triageTime: 'desc' }, // newest first
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: records.map((t) => ({
        triageId: t.id,
        caseId: t.caseId,
        severity: t.severity,
        temperature: t.temperature,
        systolic: t.systolic,
        diastolic: t.diastolic,
        heartRate: t.heartRate,
        oxygenSaturation: t.oxygenSaturation,
        respiratoryRate: t.respiratoryRate,
        nurseId: t.nurseId,
        triageTime: t.triageTime,
      })),
    };
  }
}