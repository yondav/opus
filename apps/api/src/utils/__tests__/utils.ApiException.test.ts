// src/utils/__tests__/ApiException.test.ts

import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import {
  ApiException,
  UnauthorizedException,
  NotFoundException,
  ApiExceptionFilter,
} from '../utils.ApiException';

describe('ApiException', () => {
  it('should create an ApiException with default status and code', () => {
    const exception = new ApiException('Test message');
    expect(exception.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(exception.getResponse()).toMatchObject({
      message: 'Test message',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: String(HttpStatus.INTERNAL_SERVER_ERROR),
    });
  });

  it('should create an ApiException with custom status and code', () => {
    const exception = new ApiException(
      'Custom message',
      HttpStatus.BAD_REQUEST,
      'CUSTOM_CODE'
    );
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getResponse()).toMatchObject({
      message: 'Custom message',
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'CUSTOM_CODE',
    });
  });
});

describe('UnauthorizedException', () => {
  it('should create an UnauthorizedException', () => {
    const exception = new UnauthorizedException();
    expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(exception.getResponse()).toMatchObject({
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED,
      code: 'ERR_UNAUTHORIZED',
    });
  });
});

describe('NotFoundException', () => {
  it('should create a NotFoundException with the entity name', () => {
    const exception = new NotFoundException('User');
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(exception.getResponse()).toMatchObject({
      message: 'User not found',
      statusCode: HttpStatus.NOT_FOUND,
      code: 'ERR_NOT_FOUND',
    });
  });
});

describe('ApiExceptionFilter', () => {
  it('should handle and send a structured error response for ApiException', () => {
    const response: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as ArgumentsHost;

    const exception = new ApiException(
      'Test message',
      HttpStatus.BAD_REQUEST,
      'TEST_CODE'
    );

    const filter = new ApiExceptionFilter();

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(response.json).toHaveBeenCalledWith({
      code: 'TEST_CODE',
      message: 'Test message',
      statusCode: 400,
    });
  });
});
