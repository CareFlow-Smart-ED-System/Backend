import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BillingStatus, CaseStatus } from '@prisma/client';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingStatusDto } from './dto/update-billing-status.dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  // ── 1. CREATE BILL ────────────────────────────────────────────────────────
  async createBill(dto: CreateBillingDto) {
    // Verify case exists
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: dto.caseId },
      include: { patient: true },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    // Hospital rule: only bill COMPLETED cases
    if (emergencyCase.status !== CaseStatus.COMPLETED) {
      throw new BadRequestException(
        'Billing can only be created for completed cases',
      );
    }

    // Hospital rule: one bill per case
    const existingBill = await this.prisma.billing.findUnique({
      where: { caseId: dto.caseId },
    });
    if (existingBill) {
      throw new ConflictException('A bill already exists for this case');
    }

    const bill = await this.prisma.billing.create({
      data: {
        caseId: dto.caseId,
        amount: dto.amount,
        status: BillingStatus.PENDING,
      },
    });

    return {
      message: 'Bill created successfully',
      billId: bill.id,
      caseId: bill.caseId,
      amount: bill.amount,
      status: bill.status,
    };
  }

  // ── 2. GET BILL DETAILS ───────────────────────────────────────────────────
  async getBillById(billId: string) {
    const bill = await this.prisma.billing.findUnique({
      where: { id: billId },
      include: {
        case: {
          include: { patient: true },
        },
      },
    });
    if (!bill) throw new NotFoundException('Bill not found');

    return {
      billId: bill.id,
      caseId: bill.caseId,
      patientName: `${bill.case.patient.firstName} ${bill.case.patient.lastName}`,
      amount: bill.amount,
      status: bill.status,
      createdAt: bill.createdAt,
    };
  }

  // ── 3. UPDATE BILL STATUS ─────────────────────────────────────────────────
  async updateBillStatus(billId: string, dto: UpdateBillingStatusDto) {
    const bill = await this.prisma.billing.findUnique({
      where: { id: billId },
    });
    if (!bill) throw new NotFoundException('Bill not found');

    // Hospital rule: once PAID, status is locked
    if (bill.status === BillingStatus.PAID) {
      throw new BadRequestException(
        'Cannot change status of a paid bill',
      );
    }

    // Hospital rule: SENT_TO_INSURANCE cannot go back to PENDING
    if (
      bill.status === BillingStatus.SENT_TO_INSURANCE &&
      dto.status === BillingStatus.PENDING
    ) {
      throw new BadRequestException(
        'Cannot revert a bill from SENT_TO_INSURANCE back to PENDING',
      );
    }

    const updated = await this.prisma.billing.update({
      where: { id: billId },
      data: { status: dto.status },
    });

    return {
      message: 'Bill status updated successfully',
      billId: updated.id,
      status: updated.status,
    };
  }

  // ── 4. GET BILL BY CASE ───────────────────────────────────────────────────
  async getBillByCase(caseId: string) {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });
    if (!emergencyCase) throw new NotFoundException('Case not found');

    const bill = await this.prisma.billing.findUnique({
      where: { caseId },
    });
    if (!bill) throw new NotFoundException('No billing record found for this case');

    return {
      caseId: bill.caseId,
      billId: bill.id,
      amount: bill.amount,
      status: bill.status,
    };
  }

  // ── 5. LIST ALL BILLS ─────────────────────────────────────────────────────
  async getAllBills(
    status?: BillingStatus,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [total, bills] = await Promise.all([
      this.prisma.billing.count({ where }),
      this.prisma.billing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          case: {
            include: { patient: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: bills.map((b) => ({
        billId: b.id,
        caseId: b.caseId,
        patientName: `${b.case.patient.firstName} ${b.case.patient.lastName}`,
        amount: b.amount,
        status: b.status,
        createdAt: b.createdAt,
      })),
    };
  }
}
