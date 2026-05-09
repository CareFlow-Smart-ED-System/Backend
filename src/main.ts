import { config } from 'dotenv';
config(); // Load .env variables

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('CareFlow Smart ED System API')
    .setDescription('Backend API for Emergency Department Management System')
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('admin', 'Admin management endpoints')
    .addTag('patients', 'Patient management')
    .addTag('cases', 'Emergency case management')
    .addTag('triage', 'Triage assessment')
    .addTag('queue', 'Patient queue management')
    .addTag('doctors', 'Doctor operations')
    .addTag('nurses', 'Nursing documentation')
    .addTag('notifications', 'System notifications')
    .addTag('billing', 'Payment processing')
    .addTag('appointments', 'Follow-up scheduling')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ CareFlow Backend is running on http://localhost:${port}`);
  console.log(`📚 Swagger API docs available at http://localhost:${port}/api`);
}

bootstrap();
