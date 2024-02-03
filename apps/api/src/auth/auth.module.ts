// src/auth/auth.module.ts

import { Module, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../prisma';
import { UsersService } from '../users';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth.session.service';
import { GitHub, Google, JWT, Local } from './strategies';

/**
 * AuthModule is responsible for handling authentication-related functionalities.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, '.env.development.local'],
    }),
    JwtModule.register({
      secret: process.env.SESSION_SECRET,
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    AuthSessionService,
    UsersService,
    Google.Strategy,
    GitHub.Strategy,
    Local.Strategy,
    JWT.Strategy,
    PrismaService,
  ],
})
export class AuthModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {}
}
