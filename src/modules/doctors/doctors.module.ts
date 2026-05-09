import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';           // ← add
import { PassportModule } from '@nestjs/passport';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule,PassportModule,                 
    JwtModule.register({            
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
