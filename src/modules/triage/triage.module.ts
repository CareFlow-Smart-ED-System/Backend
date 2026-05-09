import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, JwtModule, AuthModule],
  controllers: [TriageController],
  providers: [TriageService],
  exports: [TriageService],
})
export class TriageModule {}
