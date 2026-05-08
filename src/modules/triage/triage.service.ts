import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TriageService {
  constructor(private prisma: PrismaService) {}

  async createTriage() {
    // TODO: Implement create triage logic (immutable records)
  }

  async getLatestTriage() {
    // TODO: Implement get latest triage logic
  }

  async getTriageHistory() {
    // TODO: Implement get triage history logic
  }
}
