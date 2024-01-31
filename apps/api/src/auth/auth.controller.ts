// src/auth/auth.controller.ts

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import * as Dto from './dtos';
import { GitHub, Google, JWT, Local } from './strategies';

/**
 * AuthController handles authentication-related routes.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
   * Local user sign up.
   * @param data - User sign up data
   */
  @Post('local/signup')
  async signup(@Body() body: Dto.Signup) {
    const { data, ...rest } = await this.authService.localSignup(body);

    // Omitting password from user data for security reasons
    const { password, ...user } = data;

    return { ...rest, data: user };
  }

  /**
   * Local user sign in.
   * @param req
   */
  @Post('local/signin')
  @UseGuards(Local.Guard)
  async login(@Req() req: Request) {
    const { data, ...rest } = await this.authService.login(req.user);

    // Omitting password from user data for security reasons
    const { password, ...user } = data;

    return { ...rest, data: user };
  }

  @UseGuards(JWT.Guard)
  @Get('session')
  async getProfile(@Req() req) {
    return req.user;
  }
}
