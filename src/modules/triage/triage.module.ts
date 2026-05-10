import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule, JwtModule, AuthModule, NotificationsModule],
  controllers: [TriageController],
  providers: [TriageService],
  exports: [TriageService],
})
export class TriageModule {}
