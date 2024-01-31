// src/utils/types.api.ts

import type { User } from '@prisma/client';

/**
 * Represents the decoded content of a JWT (JSON Web Token).
 * email and id associated with the JWT
 * timestamps for when the JWT was issues and when it expires
 */
export interface DecodedJwtToken {
  email: string;
  id: number;
  iat: number;
  exp: number;
}

/**
 * Represents a user along with an access token.
 */
export interface UserWithToken extends User {
  access_token: string;
}
