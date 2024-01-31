// src/auth/dtos/dto.signup.ts

import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

/**
 * Data Transfer Object (DTO) for user signin.
 */
export class LoginDto {
  // User email - must be valid email address
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  public email: string;

  // User password - must meet the requirements of the strong password validation
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    { message: 'Invalid password format' }
  )
  public password: string;
}
