// src/users/dtos/dto.edit.ts

import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) for user modification.
 */
export class EditDto {
  // User email - must be valid email address
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  public email: string;

  // User password - must meet the requirements of the strong password validation
  @IsString()
  @IsOptional()
  public session: string;
}
