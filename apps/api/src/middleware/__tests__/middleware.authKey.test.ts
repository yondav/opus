// src/middleware/__tests__/middleware.authKey.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-conditional-expect */

import { Test, type TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';

import { ApiKeyMiddleware } from '../middleware.authKey';

describe('ApiKeyMiddleware', () => {
  let middleware: ApiKeyMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeyMiddleware],
    }).compile();

    middleware = module.get<ApiKeyMiddleware>(ApiKeyMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should call next when API key is valid', () => {
      const req: Partial<Request> = {
        headers: {
          'api-key': process.env.API_KEY,
        },
      };

      const res: Partial<Response> = {};

      const next = jest.fn();

      middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when API key is invalid', () => {
      const req = { headers: { 'api-key': 'invalid-key' } };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      jest.spyOn(middleware as any, 'keyValidator').mockReturnValue(false);

      middleware.use(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
