// src/prisma/prisma.service.ts

import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Create a Prisma service that extends PrismaClient and implements OnModuleInit
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * onModuleInit - Initialize the Prisma client when the module is initialized.
   * This method is called automatically by Nest.js when the module is initialized.
   */
  async onModuleInit() {
    await this.$connect(); // Establish a connection to the database
  }
}
