// src/auth/auth.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GitHub, Google, Local } from './strategies';

/**
 * AuthModule is responsible for handling authentication-related functionalities.
 */
@Module({
  // Specify the controllers associated with the AuthModule
  controllers: [AuthController],

  // Declare the providers used within the AuthModule for dependency injection
  providers: [
    AuthService, // Service handling authentication logic
    Google.Strategy, // Google authentication strategy
    GitHub.Strategy, // GitHub authentication strategy
    Local.Strategy, // Local authentication strategy (email/password)
    PrismaService, // Prisma service for interacting with the database
  ],
})
export class AuthModule {}
