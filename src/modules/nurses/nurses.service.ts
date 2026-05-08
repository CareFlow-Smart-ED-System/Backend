import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NursesService {
  constructor(private prisma: PrismaService) {}

  async createVitalSigns() {
    // TODO: Implement create vital signs logic
  }

  async getVitalSigns() {
    // TODO: Implement get vital signs logic
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
