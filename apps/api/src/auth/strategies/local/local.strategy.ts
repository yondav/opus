// src/auth/strategies/local/local.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { User } from '@prisma/client';
import * as passport from 'passport';
import { Strategy } from 'passport-local';

import { UsersService } from '../../../users';
import { UnauthorizedException } from '../../../utils';
import { AuthService } from '../../auth.service';

/**
 * Local Authentication Strategy using Passport.
 * Extends the PassportStrategy for Local OAuth.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {
    super({ usernameField: 'email', passwordField: 'password', session: true });

    // Serialize user (store user ID in the session)
    passport.serializeUser((user: User, done) => {
      done(null, user.id);
    });

    // Deserialize user (retrieve user from the session)
    passport.deserializeUser(async (id: number, done) => {
      const user = await this.usersService.getUserById(id); // Adjust this to your actual method
      done(null, user.data.id);
    });
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('unable to validate user');
    }

    return user;
  }
}
