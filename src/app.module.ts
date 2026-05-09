import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import this
import { PrismaModule } from './prisma/prisma.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Load the .env file globally across the entire app
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PrismaModule,
    PatientsModule,
    AuthModule,
  ],
})
export class AppModule {}