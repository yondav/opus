// src/app.module.ts

import { join } from 'path';

import type { MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule, AuthService } from './auth';
import { ApiKeyMiddleware, AuthTokenMiddleware } from './middleware';
import { PrismaModule } from './prisma';
import { UsersModule, UsersService } from './users';
import { ApiExceptionFilter } from './utils';

/**
 * Main module that defines the structure of the NestJS application.
 */
@Module({
  imports: [
    // Configuration module to load environment variables
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, '.env.development.local'],
    }),

    // Authentication module for handling user authentication
    AuthModule,
    // users module for handling user functionality
    UsersModule,

    // ServeStatic module to serve static files (e.g., front-end)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'web', 'dist'),
    }),

    // Prisma module for database interaction
    PrismaModule,
  ],

  // Controllers handling HTTP requests
  controllers: [AppController],

  // Services providing business logic
  providers: [
    AppService,
    AuthService,
    UsersService,
    JwtService,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthTokenMiddleware).forRoutes('users');
    consumer.apply(ApiKeyMiddleware).forRoutes('users');
  }
}
