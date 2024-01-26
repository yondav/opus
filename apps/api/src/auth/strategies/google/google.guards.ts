// src/auth/strategies/google/google.guards.ts

import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom Google Authentication Guard.
 * Extends the Passport AuthGuard for Google strategy.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  /**
   * Override the canActivate method to include additional logic.
   * @param context The current execution context.
   * @returns A boolean indicating whether the user is authenticated.
   */
  async canActivate(context: ExecutionContext) {
    // Call the canActivate method from the parent class
    const activate = (await super.canActivate(context)) as boolean;

    // Retrieve the HTTP request object from the context
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);

    return activate;
  }
}
