// src/auth/dtos/dto.signup.ts

import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Validate,
  ValidationError,
} from 'class-validator';

/**
 * Data Transfer Object (DTO) for user signup.
 */
export class SignupDto {
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

  // User password confirmation - must match the password
  @IsString()
  @Validate((value, args) => {
    const [password] = args.constraints;

    // Compare the value of passwordMatch with the password property
    if (value !== password) {
      // If they don't match, create a custom validation error
      const validationError = new ValidationError();
      validationError.value = value;
      validationError.constraints = { matchesPassword: 'Password does not match' };
      validationError.property = args.property;
      validationError.target = args.target;
      return [validationError];
    }

    // If they match, return true for successful validation
    return true;
  })
  public passwordMatch: string;
}
