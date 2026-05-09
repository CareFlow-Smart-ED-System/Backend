import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { PasswordService } from '@common/password.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, PasswordService],
  exports: [AdminService],
})
export class AdminModule {}
