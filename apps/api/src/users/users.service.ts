// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { NotFoundException } from '../exceptions';
import { PrismaService } from '../prisma';
import { ApiResponse, type Nullable } from '../utils';

/**
 * UserService handles user functionality.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all users from the database.
   * @returns {Promise<ApiResponse<Nullable<User[]>>>} A promise that resolves to an ApiResponse
   * containing the retrieved users or an error message.
   */
  async getAllUsers(): Promise<ApiResponse<Nullable<User[]>>> {
    try {
      // Attempt to retrieve all users from the database
      const users = await this.prisma.user.findMany();

      // If no users found, return an error ApiResponse
      if (!users) return ApiResponse.error(new NotFoundException('users'), 'users');

      // If users were found, return a success ApiResponse with the user data
      return ApiResponse.success(users, 'All users retrieved successfully');
    } catch (err) {
      // If an exception occurs during the process, return an ApiResponse with the exception details
      return ApiResponse.fromException(err);
    }
  }
}
