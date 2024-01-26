// src/auth/strategies/google/google.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';

/**
 * Google Authentication Strategy using Passport.
 * Extends the PassportStrategy for Google OAuth.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor for the GoogleStrategy.
   * Configures the Google OAuth strategy with client credentials.
   */
  constructor() {
    super({
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/redirect`,
      scope: ['profile', 'email'],
    });
  }

  /**
   * Validate method called when a user is authenticated.
   * PLACEHOLDER
   * @param accessToken The Google OAuth access token.
   * @param refreshToken The Google OAuth refresh token.
   * @param profile The Google user profile.
   */
  validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
  }
}

// yonbon-api:dev: {
// yonbon-api:dev:   id: '102918591953391514398',
// yonbon-api:dev:   displayName: 'Yoni David',
// yonbon-api:dev:   name: { familyName: 'David', givenName: 'Yoni' },
// yonbon-api:dev:   emails: [ { value: 'yonidavid.abr@gmail.com', verified: true } ],
// yonbon-api:dev:   photos: [
// yonbon-api:dev:     {
// yonbon-api:dev:       value: 'https://lh3.googleusercontent.com/a/ACg8ocIbFubdBys8yealyEMpieTJ9WfixHf6C5_UE-AiXd5ErV4=s96-c'
// yonbon-api:dev:     }
// yonbon-api:dev:   ],
// yonbon-api:dev:   provider: 'google',
// yonbon-api:dev:   _raw: '{\n' +
// yonbon-api:dev:     '  "sub": "102918591953391514398",\n' +
// yonbon-api:dev:     '  "name": "Yoni David",\n' +
// yonbon-api:dev:     '  "given_name": "Yoni",\n' +
// yonbon-api:dev:     '  "family_name": "David",\n' +
// yonbon-api:dev:     '  "picture": "https://lh3.googleusercontent.com/a/ACg8ocIbFubdBys8yealyEMpieTJ9WfixHf6C5_UE-AiXd5ErV4\\u003ds96-c",\n' +
// yonbon-api:dev:     '  "email": "yonidavid.abr@gmail.com",\n' +
// yonbon-api:dev:     '  "email_verified": true,\n' +
// yonbon-api:dev:     '  "locale": "en"\n' +
// yonbon-api:dev:     '}',
// yonbon-api:dev:   _json: {
// yonbon-api:dev:     sub: '102918591953391514398',
// yonbon-api:dev:     name: 'Yoni David',
// yonbon-api:dev:     given_name: 'Yoni',
// yonbon-api:dev:     family_name: 'David',
// yonbon-api:dev:     picture: 'https://lh3.googleusercontent.com/a/ACg8ocIbFubdBys8yealyEMpieTJ9WfixHf6C5_UE-AiXd5ErV4=s96-c',
// yonbon-api:dev:     email: 'yonidavid.abr@gmail.com',
// yonbon-api:dev:     email_verified: true,
// yonbon-api:dev:     locale: 'en'
// yonbon-api:dev:   }
// yonbon-api:dev: }
