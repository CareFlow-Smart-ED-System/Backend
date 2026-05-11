import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';           // ← add
import { PassportModule } from '@nestjs/passport';
import { DoctorsController } from './doctors.controller';
import { InvestigationsController } from './investigations.controller';
import { DoctorsService } from './doctors.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule,PassportModule, NotificationsModule,                 
    JwtModule.register({            
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),],
  controllers: [DoctorsController, InvestigationsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
