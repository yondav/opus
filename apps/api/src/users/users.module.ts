// src/users/users.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * UsersModule is responsible for handling users-related functionalities.
 */
@Module({
  controllers: [UsersController],

  providers: [UsersService, PrismaService],
})
export class UsersModule {}
