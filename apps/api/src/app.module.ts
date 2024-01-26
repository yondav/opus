// src/app.module.ts

import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { PrismaModule } from './prisma';

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
  providers: [AppService],
})
export class AppModule {}
