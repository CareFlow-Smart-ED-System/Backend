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
import { AppointmentsModule } from '@modules/appointments/appointments.module';
import { BillingModule } from '@modules/billing/billing.module'; 

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
    AppointmentsModule,
    BillingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}