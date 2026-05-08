import { Module } from '@nestjs/common';
import { NursesController } from './nurses.controller';
import { NursesService } from './nurses.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NursesController],
  providers: [NursesService],
  exports: [NursesService],
})
export class NursesModule {}
