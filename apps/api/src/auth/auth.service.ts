// src/auth/auth.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { isEmpty } from 'class-validator';

import { UsersService } from '../users';
import {
  ApiResponse,
  IsEmptyException,
  NotFoundException,
  UnauthorizedException,
  type DecodedJwtToken,
  type Nullable,
} from '../utils';

import type * as Dto from './dtos';

/**
 * AuthService handles user authentication and validation.
 */
@Injectable()
export class AuthService {
  private logger: Logger;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {
    this.logger = new Logger();
  }

  /**
   * Generates a JWT token based on the provided payload.
   *
   * @param {Pick<User, 'email' | 'id'>} payload - The payload for the JWT.
   * @param {boolean} [refresh=false] - Indicates whether to generate a refresh token.
   * @returns {string} - The generated JWT token.
   */
  generateJwtToken(
    payload: Pick<User, 'email' | 'id'>,
    refresh: boolean = false
  ): string {
    const expiresIn = refresh ? process.env.REFRESH_EXPIRY : process.env.SESSION_EXPIRY;

    return this.jwtService.sign(payload, {
      expiresIn,
      secret: process.env.SESSION_SECRET,
    });
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param {string} token - The JWT token to verify.
   * @returns {Nullable<DecodedJwtToken>} - The decoded JWT payload or null if verification fails.
   */
  verifyJwtToken(token: string): Nullable<DecodedJwtToken> {
    try {
      const decoded = this.jwtService.verify<DecodedJwtToken>(token, {
        secret: process.env.SESSION_SECRET,
      });

      return decoded;
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  /**
   * Validates a user's credentials.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<ApiResponse<User>>} - A user object if validation is successful, otherwise null.
   * @throws {NotFoundException} - If the user with the specified email is not found.
   */
  async validateUser(email: string, password: string): Promise<ApiResponse<User>> {
    const user = await this.usersService.getUserByEmail(email);

    if (!user.success) throw new NotFoundException(`user ${email}`);

    const passwordComparison = user
      ? await bcrypt.compare(password, user.data.password)
      : false;

    if (passwordComparison) return user;

    return null;
  }

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
