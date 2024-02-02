// src/auth/auth.session.service.ts

import { randomUUID } from 'crypto';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { Cache } from 'cache-manager';
import { isEmpty } from 'class-validator';

import {
  BadRequestException,
  IsEmptyException,
  UnauthorizedException,
  type CachedToken,
  type DecodedJwtToken,
  type Nullable,
} from '../utils';

/**
 * AuthSeesionService handles jwt token generation and validation and the handling of tokens in the cacheing layer.
 */
@Injectable()
export class AuthSessionService {
  private logger: Logger;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService
  ) {
    this.logger = new Logger();
  }

  /**
   * Generates a JWT token based on the provided payload.
   *
   * @param {Pick<User, 'email' | 'id'>} payload - The payload for the JWT.
   * @param {boolean} [refresh=false] - Indicates whether to generate a refresh token.
   * @returns {string} - The generated JWT token.
   */
  async generateJwtToken(
    payload: Pick<User, 'email' | 'id'> & { device: string; sessionId?: string },
    refresh: boolean = false
  ): Promise<string> {
    try {
      if (isEmpty(payload)) throw new IsEmptyException('payload to generate auth token');

      const expiresIn = Number(
        refresh ? process.env.REFRESH_EXPIRY : process.env.SESSION_EXPIRY
      );

      const token = this.jwtService.sign(payload, {
        expiresIn,
        secret: process.env.SESSION_SECRET,
      });

      // Post newly created token to cache
      await this.postSessionToCache({
        id: `user:${payload.id}`,
        token,
        device: payload.device,
        expiresIn,
        sessionId: payload.sessionId,
      });

      return token;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param {string} token - The JWT token to verify.
   * @returns {Nullable<DecodedJwtToken>} - The decoded JWT payload or null if verification fails.
   */
  async verifyJwtToken(
    token: string,
    device: string
  ): Promise<Nullable<{ decoded: DecodedJwtToken; sessionId: string }>> {
    try {
      if (isEmpty(token)) throw new IsEmptyException('auth token');

      const decoded = this.jwtService.verify<DecodedJwtToken>(token, {
        secret: process.env.SESSION_SECRET,
      });

      if (!decoded) throw new BadRequestException('invalid jwt token');

      const inCache = await this.getSingleSessionFromCache(decoded.id, device);

      if (!inCache) throw new UnauthorizedException('jwt token is expired');

      return { sessionId: inCache.id, decoded };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Posts a user session to the caching layer.
   *
   * @param {Object} params - Parameters for the user session.
   * @param {string} params.id - The user ID.
   * @param {string} params.token - The JWT token associated with the session.
   * @param {string} params.device - The device identifier for the session.
   * @param {number} params.expiresIn - The expiration time for the session in seconds.
   * @param {string} [params.sessionId] - (Optional) The session ID. If not provided, a random UUID is generated.
   * @returns {Promise<void>} - A Promise that resolves when the session is successfully cached.
   */
  async postSessionToCache({
    id,
    token,
    device,
    expiresIn,
    sessionId,
  }: CachedToken & {
    expiresIn: number;
    sessionId?: string;
  }): Promise<void> {
    try {
      await this.cacheManager.set(
        `${id}:${sessionId ?? randomUUID()}`,
        { token, device },
        expiresIn
      );
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Retrieves a single user session from the caching layer based on the provided user ID and device.
   *
   * @param {number} id - The user ID.
   * @param {string} device - The device identifier for the session.
   * @returns {Promise<CachedToken>} - A Promise that resolves with the user session data if found.
   * @throws {Error} - Throws an error if there is any issue during the retrieval process.
   */
  async getSingleSessionFromCache(id: number, device: string): Promise<CachedToken> {
    try {
      const activeSessions = await this.getActiveSessionsFromCache(id);

      const session = activeSessions.find(session => session.device === device);

      return session;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Retrieves all active user sessions from the caching layer based on the provided user ID.
   *
   * @param {number} id - The user ID.
   * @returns {Promise<CachedToken[]>} - A Promise that resolves with an array of active user sessions.
   * @throws {Error} - Throws an error if there is any issue during the retrieval process.
   */
  async getActiveSessionsFromCache(id: number): Promise<CachedToken[]> {
    try {
      const keys = await this.cacheManager.store.keys(`user:${id}*`);

      // If no matching keys are found, return an empty array
      if (!keys || keys.length === 0) return [];

      const tokens = (await this.cacheManager.store.mget(...keys)) as {
        token: string;
        device: string;
      }[];

      // If no matching keys are found, return an empty array
      const sessions = keys.map((key, index) => {
        const [, userId, sessionId] = key.split(':');

        // Extract token and device from the corresponding data
        const { token, device } = tokens[index];

        return {
          id: `user:${userId}:${sessionId}`,
          device,
          token,
        };
      });

      return sessions;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  /**
   * Deletes the active user session from the caching layer based on the provided user ID.
   *
   * @param {number} id - The user ID.
   * @returns {Promise<void>} - A Promise that resolves when the deletion is successful.
   * @throws {Error} - Throws an error if there is any issue during the deletion process.
   */
  async deleteActiveSessionFromCache(id: number): Promise<void> {
    try {
      await this.cacheManager.del(id.toString());
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
