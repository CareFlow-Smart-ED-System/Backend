import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async quickRegister() {
    // TODO: Implement quick registration logic
  }

  async linkAccount() {
    // TODO: Implement link account logic
  }

  async getProfile() {
    // TODO: Implement get profile logic
  }

  async updateProfile() {
    // TODO: Implement update profile logic
  }

  async getMedicalRecords() {
    // TODO: Implement get medical records logic
  }

  async createMedicalRecord() {
    // TODO: Implement create medical record logic
  }

  async updateMedicalRecord() {
    // TODO: Implement update medical record logic
  }
}
