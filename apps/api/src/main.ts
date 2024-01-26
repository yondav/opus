// src/main.ts

import { NestFactory } from '@nestjs/core';

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

  // Set a global prefix for all routes (e.g., /api)
  app.setGlobalPrefix('api');

  // Start the application and listen on the specified port (from environment variables)
  await app.listen(process.env.PORT);
}

bootstrap();
