// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * PrismaModule is responsible for handling ORM integration.
 */
@Module({
  // Declare the PrismaService as a provider within the module
  providers: [PrismaService],

  // Export the PrismaService to make it available for dependency injection in other modules
  exports: [PrismaService],
})
export class PrismaModule {}
