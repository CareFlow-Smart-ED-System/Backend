import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AdminModule } from '@modules/admin/admin.module';
import { NursesModule } from '@modules/nurses/nurses.module';
import { DoctorsModule } from '@modules/doctors/doctors.module';
import { QueueModule } from '@modules/queue/queue.module';
import { PatientsModule } from '@modules/patients/patients.module';
import { TriageModule } from '@modules/triage/triage.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { CasesModule } from '@modules/cases/cases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    NursesModule,
    DoctorsModule,
    TriageModule,
    QueueModule,
    CasesModule,
    PatientsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}