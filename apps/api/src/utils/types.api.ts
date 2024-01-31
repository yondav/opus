// src/utils/types.api.ts

import type { User } from '@prisma/client';

import type { Nullable } from './types.generic';

export interface ApiResponse<T> {
  success: boolean;
  data: Nullable<T>;
  error: Nullable<Error>;
  message: string;
}

export interface DecodedJwtToken {
  email: string;
  id: number;
  iat: number;
  exp: number;
}

export interface UserWithToken extends User {
  access_token: string;
}
