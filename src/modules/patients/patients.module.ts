import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { CasesController } from './cases.controller'; 
import { PatientsService } from './patients.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { PasswordService } from '@common/password.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PatientsController, CasesController],
  providers: [PatientsService, PasswordService],
  exports: [PatientsService],
})
export class PatientsModule {}
