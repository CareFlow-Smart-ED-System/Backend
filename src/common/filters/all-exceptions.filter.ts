import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message =
          exceptionResponse['message'] || exception.message || message;
        errors = exceptionResponse['errors'] || [];
      } else {
        message = exceptionResponse.toString();
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      if (exception.code === 'P2025') {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
      } else if (exception.code === 'P2002') {
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
      } else if (exception.code === 'P2003') {
        // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference to related resource';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // Convert generic Error messages to appropriate HTTP exceptions
      const errorMessage = exception.message.toLowerCase();

      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist')
      ) {
        status = HttpStatus.NOT_FOUND;
      } else if (
        errorMessage.includes('not authorized') ||
        errorMessage.includes('not assigned') ||
        errorMessage.includes('forbidden')
      ) {
        status = HttpStatus.FORBIDDEN;
      } else if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('taken') ||
        errorMessage.includes('duplicate')
      ) {
        status = HttpStatus.CONFLICT;
      } else if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('required')
      ) {
        status = HttpStatus.BAD_REQUEST;
      }

      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      errors,
    });
  }
}
