// src/utils/utils.ApiException.ts

import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

// Represents the structure of an error response.
export interface ErrorResponse {
  code: string; // A code or identifier for the error.
  message: string; // A human-readable error message.
  statusCode: HttpStatus; // The HTTP status code associated with the error.
}

// A custom exception class for handling application-specific exceptions.
export class ApiException extends HttpException {
  /**
   * Create a new instance of ApiException.
   * @param message - The error message.
   * @param status - The HTTP status code (default: HttpStatus.INTERNAL_SERVER_ERROR).
   * @param code - An optional error code or identifier (default: a string representation of the status code).
   */
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code?: string
  ) {
    super(
      {
        message,
        statusCode: status,
        code: code || String(status),
      },
      status
    );
  }
}

// A custom exception class for handling resource is bad request exceptions.
export class BadRequestException extends ApiException {
  /**
   * Create a new instance of BadRequestException.
   * @param message - message to be delivered via exception.
   */
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'ERR_BAD_REQUEST');
  }
}
// A custom exception class for handling unauthorized access exceptions.
export class UnauthorizedException extends ApiException {
  // Create a new instance of UnauthorizedException.
  constructor(message?: string) {
    super(
      `Unauthorized${message ? `: ${message}` : ''}`,
      HttpStatus.UNAUTHORIZED,
      'ERR_UNAUTHORIZED'
    );
  }
}

// A custom exception class for handling resource not found exceptions.
export class NotFoundException extends ApiException {
  /**
   * Create a new instance of NotFoundException.
   * @param entity - The name of the entity or resource that was not found.
   */
  constructor(entity: string) {
    super(`${entity} not found`, HttpStatus.NOT_FOUND, 'ERR_NOT_FOUND');
  }
}

// A custom exception class for handling resource is empty exceptions.
export class IsEmptyException extends ApiException {
  /**
   * Create a new instance of IsEmptyException.
   * @param entity - The name of the entity or resource that is empty.
   */
  constructor(entity: string) {
    super(`${entity} must be provided`, HttpStatus.BAD_REQUEST, 'ERR_BAD_REQUEST');
  }
}

// A custom exception filter for handling 'ApiException' instances.
@Catch(ApiException)
export class ApiExceptionFilter implements ExceptionFilter {
  /**
   * Handles exceptions of type 'ApiException' and sends a structured error response.
   * @param exception - The exception that was caught.
   * @param host - The execution context and host details.
   */
  catch(exception: ApiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { statusCode, code, message } = exception.getResponse() as ErrorResponse;

    response.status(statusCode).json({
      code,
      message,
      statusCode,
    });
  }
}
