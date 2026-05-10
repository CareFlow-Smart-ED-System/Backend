import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CaseStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async getPriorityQueue(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  const cases = await this.prisma.emergencyCase.findMany({
    where: { status: { in: [CaseStatus.WAITING, CaseStatus.UNDER_TREATMENT] } },
    include: {
      patient: { include: { user: true } },
      triage: true,
    },
  });
  const severityOrder = (s?: string | null) =>
    s === 'CRITICAL' ? 1 : s === 'URGENT' ? 2 : 3;
  cases.sort((a, b) => {
    const aTri = Array.isArray(a.triage) ? a.triage[0] : a.triage;
    const bTri = Array.isArray(b.triage) ? b.triage[0] : b.triage;
    const diff = severityOrder(aTri?.severity) - severityOrder(bTri?.severity);
    if (diff !== 0) return diff;
    return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
  });
  const total = cases.length;
  const paginated = cases.slice(skip, skip + limit);
  const now = new Date();
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: paginated.map((c, index) => {
      const tri = Array.isArray(c.triage) ? c.triage[0] : c.triage;
      return {
        position: skip + index + 1,
        caseId: c.id,
        patientName: c.patient.user.displayName,
        severity: tri?.severity ?? 'UNKNOWN',
        status: c.status,
        arrivalTime: c.arrivalTime,
        waitingMinutes: Math.floor(
          (now.getTime() - new Date(c.arrivalTime).getTime()) / 60000,
        ),
      };
    }),
  };
}

  async getQueueStatistics() {
  const activeCases = await this.prisma.emergencyCase.findMany({
    where: { status: { in: [CaseStatus.WAITING, CaseStatus.UNDER_TREATMENT] } },   // ← use enum
    include: { triage: true },
  });

  const now = new Date();
  let totalWaitMs = 0;
  const bySeverity = { Critical: 0, Urgent: 0, 'Non-Urgent': 0 };

  for (const c of activeCases) {
    totalWaitMs += now.getTime() - new Date(c.arrivalTime).getTime();
    const tri = Array.isArray(c.triage) ? c.triage[0] : c.triage;
    const sev = tri?.severity?.toUpperCase();
    if (sev === 'CRITICAL') bySeverity.Critical++;
    else if (sev === 'URGENT') bySeverity.Urgent++;
    else bySeverity['Non-Urgent']++;
  }

  const totalWaiting = activeCases.length;
  return {
    totalWaiting,
    bySeverity,
    averageWaitMinutes: totalWaiting > 0
      ? Math.floor(totalWaitMs / totalWaiting / 60000)
      : 0,
  };
}
}
