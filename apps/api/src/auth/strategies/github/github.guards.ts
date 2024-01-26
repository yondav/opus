// src/auth/strategies/github/github.guards.ts

import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom GitHub Authentication Guard.
 * Extends the Passport AuthGuard for GitHub strategy.
 */
@Injectable()
export class GitHubAuthGuard extends AuthGuard('github') {
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
