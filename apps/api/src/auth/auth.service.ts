// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma';

/**
 * AuthService handles user authentication and validation.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates a user's credentials.
   * @param email - The user's email address
   * @param password - The user's password
   * @returns A user object if validation is successful, otherwise null
   */
  async validateUser(email: string, password: string) {
    // Retrieve user information from the database based on the provided email
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Compare the provided password with the hashed password stored in the database if the user exists
    const passwordComparison = user
      ? await bcrypt.compare(password, user.password)
      : false;

    // If password validation is successful, return user information without the password
    if (passwordComparison) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    // If validation fails, return null
    return null;
  }
}
