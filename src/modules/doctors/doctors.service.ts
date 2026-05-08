import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async listDoctors() {
    // TODO: Implement list doctors logic
  }

  async getAssignedCases() {
    // TODO: Implement get assigned cases logic
  }

  async getLabResults() {
    // TODO: Implement get lab results logic
  }

  async getImagingReports() {
    // TODO: Implement get imaging reports logic
  }

  async prescribeMedication() {
    // TODO: Implement prescribe medication logic
  }
}
