import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
    console.log(`Swagger API docs available at http://localhost:${process.env.PORT ?? 3000}/api`);
  });
}
bootstrap();
