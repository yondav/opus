// src/auth/auth.service.ts

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { isEmpty } from 'class-validator';
import type { Request } from 'express';

import { UsersService } from '../users';
import {
  ApiResponse,
  BadRequestException,
  IsEmptyException,
  NotFoundException,
  UnauthorizedException,
  type UserWithToken,
} from '../utils';

import { AuthSessionService } from './auth.session.service';
import type * as Dto from './dtos';

/**
 * AuthService handles user authentication and validation.
 */
@Injectable()
export class AuthService {
  private logger: Logger;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    public sessionService: AuthSessionService,
    private readonly usersService: UsersService
    // private readonly jwtService: JwtService
  ) {
    this.logger = new Logger();
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

  /**
   * Handles local user signup with email and password.
   *
   * @param {Dto.Signup} data - The signup data including email, password, and password confirmation.
   * @returns {Promise<ApiResponse<UserWithToken>>} - ApiResponse containing user information with an access token or an error.
   */
  async localSignup(
    req: Request,
    { email, password, passwordMatch }: Dto.Signup
  ): Promise<ApiResponse<UserWithToken>> {
    try {
      // Check if registration data (email, password, passwordMatch) is empty
      if (isEmpty({ email, password, passwordMatch }))
        throw new IsEmptyException('registration data');

      // Check if password and password confirmation match
      if (password !== passwordMatch)
        return ApiResponse.error(
          new BadRequestException("password and confirmation password don't match")
        );

      // Create a new user with the provided email and password
      const user = await this.createUser({ email, password });

      // If user creation is unsuccessful, return an error response
      if (!user.success) return ApiResponse.error(new BadRequestException(user.message));

      // Log in the user and obtain an access token
      const {
        data: { access_token },
      } = await this.localLogin(user, req.headers);

      // Return a success response with the created user information and access token
      return ApiResponse.success(
        { ...user.data, access_token },
        `user ${user.data.email} account successfully created ${
          access_token ? 'and authenticated' : 'but not authenticated'
        }`
      );
    } catch (err) {
      // Return an error response in case of exceptions
      return ApiResponse.error(err);
    }
  }

  /**
   * Logs in a user and generates an access token.
   *
   * @param {Request['user']} req - The user data from the request.
   * @returns {Promise<ApiResponse<UserWithToken>>} - ApiResponse containing user information with an access token or an error.
   */
  async localLogin(
    req: Request['user'],
    headers: Request['headers']
  ): Promise<ApiResponse<UserWithToken>> {
    try {
      // Cast the user response from the request to ApiResponse<User>
      const userResponse = req as ApiResponse<User>;

      // Extract payload information from the user response
      const payload = {
        email: userResponse.data.email,
        id: userResponse.data.id,
        device: headers['user-agent'],
      };

      // Retrieve the user details from the database using the payload ID
      const user = await this.usersService.getUserById(payload.id);

      // Generate an access token using the payload information
      const accessToken = await this.sessionService.generateJwtToken(payload);

      // Return a success response with the user information and access token
      return ApiResponse.success(
        {
          ...user.data,
          access_token: accessToken,
        },
        `user ${payload.email} logged in`
      );
    } catch (err) {
      // Return an error response in case of exceptions
      return ApiResponse.error(err);
    }
  }

  async localLogout(id: number) {
    try {
      await this.cacheManager.del(id.toString());

      return ApiResponse.success(null, `user ${id} logged out`);
    } catch (err) {
      // Return an error response in case of exceptions
      return ApiResponse.error(err);
    }
  }
}
