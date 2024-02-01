// src/middleware/__tests__/middleware.suthToken.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-conditional-expect */

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';

import { AuthService } from '../../auth';
import { PrismaService } from '../../prisma';
import { UsersService } from '../../users';
import { AuthTokenMiddleware } from '../middleware.authToken';

describe('AuthTokenMiddleware', () => {
  let middleware: AuthTokenMiddleware;

  const validToken =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlc3QuY29tIiwiaWQiOjY3LCJpYXQiOjE3MDY4MDYyMjcsImV4cCI6MTcwNjg5MjYyN30.WDV9u8wjWFwrUnmjOCTMgp3HDW0GWee0YLLpm9Y3IsU';

  beforeEach(async () => {
    const cacheManagerMock = {
      // get: jest.fn(),
      set: jest.fn(),
      // del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenMiddleware,
        AuthService,
        UsersService,
        JwtService,
        PrismaService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    middleware = module.get<AuthTokenMiddleware>(AuthTokenMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should call next when API Token is valid', async () => {
      const req: Partial<Request> = {
        headers: {
          authorization: validToken,
        },
      };
      const res: Partial<Response> = {};
      const next = jest.fn();

      await middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when API Token is not provided', async () => {
      const req = { headers: { authorization: undefined } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw UnauthorizedException when API Token is not valid', async () => {
      const req = { headers: { authorization: 'Bearer invalid-token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should create a refresh token when API Token is within 5 minutes of expiration', async () => {
      // Mock the authService.verifyJwtToken to return a decoded token with 4 minutes until expiration
      jest.spyOn(middleware['authService'], 'verifyJwtToken').mockReturnValueOnce(
        Promise.resolve({
          exp: Math.floor(Date.now() / 1000) + 240, // 4 minutes in the future
          iat: Math.floor(Date.now() / 1000) - 23 * 60 * 60 - 56 * 60,
          email: 'test1@test.com',
          id: 67,
        })
      );

      const req = {
        headers: {
          authorization: validToken,
        },
      };

      const res = {
        setHeader: jest.fn(),
      };

      const next = jest.fn();

      await middleware.use(req as any, res as any, next);

      expect(res.setHeader).toHaveBeenCalledWith('refresh-token', expect.any(String));

      expect(next).toHaveBeenCalled();
    });
  });
});
