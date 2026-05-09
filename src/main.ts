import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Set the global prefix (so URLs start with /api/v1)
  app.setGlobalPrefix('api/v1');

  // 2. Enable global validation for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // 3. Register our custom error handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Enable CORS (crucial for when the frontend tries to connect)
  app.enableCors();

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000/api/v1`);
}
bootstrap();