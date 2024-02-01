// src/middleware/refresh.middleware.ts

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { AuthService } from '../auth/auth.service';
import { UnauthorizedException } from '../utils';

@Injectable()
export class AuthTokenMiddleware implements NestMiddleware {
  /**
   * Creates an instance of RefreshMiddleware.
   * @param {AuthService} authService - The authentication service for handling token operations.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Middleware function to handle token refresh logic.
   *
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {void}
   */
  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract the JWT token from the Authorization header
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];

      // Check if the token is not provided
      if (!token) throw new UnauthorizedException('no token provided');

      // Verify the JWT token and get the decoded payload
      const decoded = this.authService.verifyJwtToken(token);

      if (!decoded) throw new UnauthorizedException('invalid token');
      // Get the current time and token expiry details
      const currentTime = Date.now();
      const tokenExpiry = decoded.exp * 1000; // Convert seconds to milliseconds
      const tokenExpiryThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

      // Check if the token is within 5 minutes of expiring and refresh it if needed
      if (tokenExpiry - currentTime < tokenExpiryThreshold) {
        const refreshToken = this.authService.generateJwtToken(
          { email: decoded.email, id: decoded.id },
          true
        );

        res.setHeader('refresh-token', refreshToken);
      }

      req.user = decoded;

      next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, data: null, error: err, message: '' });
    }
  }
}
