// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { isEmpty } from 'class-validator';

import { UsersService } from '../users';
import { ApiResponse, IsEmptyException, UnauthorizedException } from '../utils';

import type * as Dto from './dtos';

/**
 * AuthService handles user authentication and validation.
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user with the provided email and password.
   *
   * @param {Omit<Dto.Signup, 'passwordMatch'>} data - The user registration data.
   * @returns {Promise<ApiResponse<User>>} - ApiResponse containing user information or an error.
   */
  async createUser(data: Omit<Dto.Signup, 'passwordMatch'>): Promise<ApiResponse<User>> {
    try {
      // Check if registration data (email and password) is empty
      if (isEmpty(data)) throw new IsEmptyException('registration data');

      const { email, password } = data;

      // Check if a user with the provided email already exists
      const existingUser = await this.usersService.getUserByEmail(email);

      // If a user with the email exists, return an error response
      if (existingUser.success)
        return ApiResponse.error(
          new UnauthorizedException(
            `account already exists for ${existingUser.data.email}`
          )
        );

      // Hash the user's password before creating the user
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user with the hashed password
      const user = await this.usersService.createUser({
        email,
        password: hashedPassword,
      });

      // Return a success response with the created user information
      return user;
    } catch (err) {
      // Return an error response in case of exceptions
      return ApiResponse.fromException(err);
    }
  }
}
