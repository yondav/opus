// src/users/users.controller.ts

/* eslint-disable no-unused-vars  */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';

import type * as Dto from './dtos';
import { UsersService } from './users.service';

/**
 * UsersController handles user-related routes.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users.
   */
  @Get('')
  async getAllUsers() {
    const { data, ...rest } = await this.usersService.getAllUsers();

    // Omitting password from user data for security reasons
    const sanitizedData = data.map(d => {
      const { password, ...user } = d;
      return user;
    });

    return {
      ...rest,
      data: sanitizedData,
    };
  }

  /**
   * Get user by ID.
   * @param id - User ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: `${number}`) {
    const { data, ...rest } = await this.usersService.getUserById(Number(id));

    // Omitting password from user data for security reasons
    const { password, ...user } = data;

    return { ...rest, data: user };
  }

  /**
   * Edit user by ID.
   * @param id - User ID
   * @param body - Partial user data to update
   */
  @Put(':id')
  async editUser(@Param('id') id: `${number}`, @Body() body: Partial<Dto.Edit>) {
    const { data, ...rest } = await this.usersService.editUser(Number(id), body);

    // Omitting password from user data for security reasons
    const { password, ...user } = data;

    return { ...rest, data: user };
  }

  /**
   * Delete user by ID.
   * @param id - User ID
   */
  @Delete(':id')
  async deleteUser(@Param('id') id: `${number}`) {
    return this.usersService.deleteUser(Number(id));
  }
}
