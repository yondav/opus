// src/auth/strategies/local/local.guards.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom Local Authentication Guard.
 * Extends the Passport AuthGuard for Local strategy.
 */
@Injectable()
export class LocalGuard extends AuthGuard('local') {}
