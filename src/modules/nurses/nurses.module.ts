import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NursesController } from './nurses.controller';
import { NursesService } from './nurses.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule,PassportModule, NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),],
  controllers: [NursesController],
  providers: [NursesService],
  exports: [NursesService],
})
export class NursesModule {}
