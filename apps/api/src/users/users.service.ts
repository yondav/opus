// src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { isEmpty } from 'class-validator';

import {
  IsEmptyException,
  NotFoundException,
  UnauthorizedException,
} from '../exceptions';
import { PrismaService } from '../prisma';
import { ApiResponse, type Nullable } from '../utils';

import type * as Dto from './dtos';

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

  /**
   * Retrieves a user by ID from the database.
   * @param {number} id - The ID of the user to retrieve.
   * @returns {Promise<ApiResponse<User>>} A promise that resolves to an ApiResponse
   * containing the retrieved user or an error message.
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      // Check if the ID is empty or not a valid number
      if (isEmpty(id)) throw new IsEmptyException('id');

      // Attempt to retrieve the user from the database using the ID
      const user = await this.prisma.user.findUnique({ where: { id } });

      // If no user found, return an error ApiResponse
      if (!user) return ApiResponse.error(new NotFoundException(`user ${id}`));

      // If user was found, return a success ApiResponse with the user data
      return ApiResponse.success(user, `user ${id} retrieved successfully`);
    } catch (err) {
      // If an exception occurs during the process, return an ApiResponse with the exception details
      return ApiResponse.fromException(err);
    }
  }

  /**
   * Retrieves a user by email address from the database.
   * @param {string} email - The email address of the user to retrieve.
   * @returns {Promise<ApiResponse<User>>} A promise that resolves to an ApiResponse
   * containing the retrieved user or an error message.
   */
  async getUserByEmail(email: Dto.Create['email']): Promise<ApiResponse<User>> {
    try {
      // Check if the email is empty or not a valid string
      if (isEmpty(email)) throw new IsEmptyException('email');

      // Attempt to retrieve the user from the database using the email
      const user = await this.prisma.user.findUnique({ where: { email } });

      // If no user found, return an error ApiResponse
      if (!user) return ApiResponse.error(new NotFoundException(`user ${email}`));

      // If user was found, return a success ApiResponse with the user data
      return ApiResponse.success(user, `user ${email} retrieved successfully`);
    } catch (err) {
      // If an exception occurs during the process, return an ApiResponse with the exception details
      return ApiResponse.fromException(err);
    }
  }

  /**
   * Deletes a user from the database by their ID.
   * @param {number} id - The ID of the user to be deleted.
   * @returns {Promise<ApiResponse<void>>} A promise that resolves to an ApiResponse
   * indicating the success or failure of the deletion operation.
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      // Check if the ID is empty or not a valid number
      if (isEmpty(id)) throw new IsEmptyException('id');

      // Attempt to retrieve the user from the database using the ID
      const user = await this.prisma.user.findUnique({ where: { id } });

      // If no user found, return an error ApiResponse
      if (!user) return ApiResponse.error(new NotFoundException(`user ${id}`));

      // If user was found, delete the user from the database
      await this.prisma.user.delete({ where: { id } });

      // Return a success ApiResponse indicating successful deletion
      return ApiResponse.success(null, `user ${id} deleted successfully`);
    } catch (err) {
      // If an exception occurs during the process, return an ApiResponse with the exception details
      return ApiResponse.fromException(err);
    }
  }

  /**
   * Creates a new user in the database.
   * @param {Dto.Create} data - The user registration data.
   * @returns {Promise<ApiResponse<User>>} A promise that resolves to an ApiResponse
   * indicating the success or failure of the user creation operation.
   */
  async createUser(data: Dto.Create): Promise<ApiResponse<User>> {
    try {
      // Check if the registration data is empty
      if (isEmpty(data)) throw new IsEmptyException('registration data');

      const { email } = data;

      // Check if a user with the same email already exists
      const existingUser = await this.getUserByEmail(email);

      // If a user with the same email exists, return an error ApiResponse
      if (existingUser.success)
        return ApiResponse.error(
          new UnauthorizedException(
            `account already exists for ${existingUser.data.email}`
          )
        );

      // If no existing user, create a new user in the database
      const user = await this.prisma.user.create({ data });

      // Return a success ApiResponse indicating successful user creation
      return ApiResponse.success(user, `user ${user.email} created successfully`);
    } catch (err) {
      // If an exception occurs during the process, return an ApiResponse with the exception details
      return ApiResponse.fromException(err);
    }
  }
}
