// src/middleware/auth.middleware.ts

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedException } from '../utils';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly apiKey = process.env.API_KEY;

  /**
   * Creates an instance of ApiKeyMiddleware.
   */
  constructor() {}

  private keyValidator(apiKey = '') {
    // Check if the lengths are different
    if (this.apiKey.length !== apiKey.length)
      throw new UnauthorizedException('invalid key');

    // Convert strings to arrays and sort them
    const sortedKey = this.apiKey.split('').sort().join('');
    const sortedReqKey = apiKey.split('').sort().join('');

    // check if keys are the same
    return sortedKey === sortedReqKey;
  }

  /**
   * Middleware function to handle api key logic.
   *
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {void}
   */
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const requestApiKey = req.headers['api-key'];

      const isValid = this.keyValidator(requestApiKey as string);

      if (!isValid) throw new UnauthorizedException('api key not valid');

      next();
    } catch (err) {
      next(err);
    }
  }
}
