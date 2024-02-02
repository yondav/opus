// src/middleware/middleware.sessionLimit.ts
import { BadRequestException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { AuthService } from '../auth';
import { UsersService } from '../users';

/**
 * Middleware to check and enforce session limits for a user.
 */
@Injectable()
export class SessionLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Implementation of the middleware.
   *
   * @param {Request} req - The incoming HTTP request.
   * @param {Response} res - The HTTP response object.
   * @param {NextFunction} next - The callback function to invoke the next middleware in the chain.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Retrieve user details based on the provided email
      const user = await this.usersService.getUserByEmail(req.body.email);

      // Throw an exception if the user details retrieval is unsuccessful
      if (!user.success) throw new BadRequestException('unable to find user');

      // Retrieve active sessions for the user
      const activeSessions =
        await this.authService.sessionService.getActiveSessionsFromCache(user.data.id);

      // Check if there is an active session on the current device
      const activeSessionOnCurrentDevice = activeSessions.find(
        session => session.device === req.headers['user-agent']
      );

      // Return a conflict response if there is an active session on the current device
      if (activeSessionOnCurrentDevice)
        return res.status(409).json({
          success: false,
          message: 'user is already signed in',
          data: activeSessionOnCurrentDevice,
        });

      // Return a conflict response if the user has exceeded the session limit
      if (activeSessions.length > 2)
        return res.status(409).json({
          success: false,
          message: `${activeSessions.length} active sessions`,
          data: { activeSessions },
        });

      // Continue to the next middleware if all checks pass
      next();
    } catch (err) {
      // Invoke the error-handling middleware in case of an exception
      next(err);
    }
  }
}
