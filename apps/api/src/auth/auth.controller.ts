// src/auth/auth.controller.ts

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import * as Dto from './dtos';
import { GitHub, Google, Local } from './strategies';

/**
 * AuthController handles authentication-related routes.
 */
@Controller('auth')
export class AuthController {
  /**
   * Initiates the Google OAuth login process.
   * PLACEHOLDER
   */
  @Get('google/login')
  @UseGuards(Google.Guard)
  handleGoogleLogin() {
    return { message: 'google auth' };
  }

  /**
   * Handles the redirection after a successful Google OAuth login.
   * PLACEHOLDER
   */
  @Get('google/redirect')
  @UseGuards(Google.Guard)
  handleGoogleRedirect() {
    return { message: 'google redirect' };
  }

  /**
   * Initiates the GitHub OAuth login process.
   * PLACEHOLDER
   */
  @Get('github/login')
  @UseGuards(GitHub.Guard)
  async handleGitHubLogin() {
    return { message: 'github auth' };
  }

  /**
   * Handles the redirection after a successful GitHub OAuth login.
   * PLACEHOLDER
   */
  @Get('github/redirect')
  @UseGuards(GitHub.Guard)
  async handleGitHubRedirect() {
    // GitHub authentication callback
    return { message: 'github redirect' };
  }

  /**
   * Handles the local user signup process.
   * @param data - User signup data
   * PLACEHOLDER
   */
  @Post('local/signup')
  @UseGuards(Local.Guard)
  async signup(@Body() data: Dto.Signup) {
    // This endpoint will only be reached if local authentication is successful
    return data;
  }
}
