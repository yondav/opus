// src/main.ts

import { Logger } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as passport from 'passport';

import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize the NestJS application.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function bootstrap() {
  // Create an instance of the Nest application
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true, // Set to true to prevent access via JavaScript
        secure: process.env.NODE_ENV === 'production', // Set to true in production if using HTTPS
        maxAge: Number(process.env.SESSION_EXPIRY), // Set the max age of the cookie (optional)
      },
    })
  );

  app.use(passport.initialize());

  const corsOptions: CorsOptions = {
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['refresh-token'],
  };

  app.enableCors(corsOptions);

  // Set a global prefix for all routes (e.g., /api)
  app.setGlobalPrefix('api');

  app.useLogger(new Logger());

  // Start the application and listen on the specified port (from environment variables)
  await app.listen(process.env.PORT);
}

bootstrap();
