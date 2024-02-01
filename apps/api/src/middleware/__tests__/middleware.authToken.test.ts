// src/middleware/__tests__/middleware.suthToken.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-conditional-expect */

import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';

import { AuthService } from '../../auth';
import { PrismaService } from '../../prisma';
import { UsersService } from '../../users';
import { UnauthorizedException } from '../../utils';
import { AuthTokenMiddleware } from '../middleware.authToken';

describe('AuthTokenMiddleware', () => {
  let middleware: AuthTokenMiddleware;

  const validToken =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlc3QuY29tIiwiaWQiOjY3LCJpYXQiOjE3MDY3MTA3OTMsImV4cCI6MTcwNjc5NzE5M30.BDxPrzwk5yl93ctojGEDgWQT4onlVLr6KDwUgGNNZ28';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenMiddleware,
        AuthService,
        UsersService,
        JwtService,
        PrismaService,
      ],
    }).compile();

    middleware = module.get<AuthTokenMiddleware>(AuthTokenMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
  describe('use', () => {
    it('should call next when API Token is valid', () => {
      const req: Partial<Request> = {
        headers: {
          authorization: validToken,
        },
      };
      const res: Partial<Response> = {};
      const next = jest.fn();

      middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when API Token is not provided', () => {
      const req = { headers: { authorization: undefined } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware.use(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);

      // Check the error properties directly
      const error = (res.json as jest.Mock).mock.calls[0][0].error;
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.response.message).toBe('Unauthorized: no token provided');
      expect(error.response.statusCode).toBe(401);
      expect(error.response.code).toBe('ERR_UNAUTHORIZED');

      expect(next).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when API Token is not valid', () => {
      const req = { headers: { authorization: 'Bearer invalid-token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      middleware.use(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);

      // Check the error properties directly
      const error = (res.json as jest.Mock).mock.calls[0][0].error;
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.response.message).toBe('Unauthorized: invalid token');
      expect(error.response.statusCode).toBe(401);
      expect(error.response.code).toBe('ERR_UNAUTHORIZED');

      expect(next).not.toHaveBeenCalled();
    });

    it('should create a refresh token when API Token is within 5 minutes of expiration', () => {
      // Mock the authService.verifyJwtToken to return a decoded token with 4 minutes until expiration
      jest.spyOn(middleware['authService'], 'verifyJwtToken').mockReturnValueOnce({
        exp: Math.floor(Date.now() / 1000) + 240, // 4 minutes in the future
        iat: Math.floor(Date.now() / 1000) - 23 * 60 * 60 - 56 * 60,
        email: 'test1@test.com',
        id: 123,
      });

      const req = {
        headers: {
          authorization: validToken,
        },
      };
      const res = {
        setHeader: jest.fn(),
      };
      const next = jest.fn();

      middleware.use(req as any, res as any, next);

      expect(res.setHeader).toHaveBeenCalledWith('refresh-token', expect.any(String));

      expect(next).toHaveBeenCalled();
    });
  });
});
