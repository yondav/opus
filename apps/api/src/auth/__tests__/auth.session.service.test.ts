// src/auth/__tests__/auth.session.service.test.ts

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';

import {
  BadRequestException,
  IsEmptyException,
  UnauthorizedException,
  type CachedToken,
} from '../../utils';
import { AuthSessionService } from '../auth.session.service';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'mocked-random-uuid'),
}));

const jwtServiceMock = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const cacheManagerMock = {
  set: jest.fn(),
  get: jest.fn(),
  store: {
    keys: jest.fn(),
    mget: jest.fn(),
  },
  del: jest.fn(),
};

describe('AuthSessionService', () => {
  let authSessionService: AuthSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSessionService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    authSessionService = module.get<AuthSessionService>(AuthSessionService);
  });

  describe('generateJwtToken', () => {
    it('should throw an error if a payload is not provided', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        async () => await authSessionService.generateJwtToken()
      ).rejects.toThrow(new IsEmptyException('payload to generate auth token'));
    });

    it('should create a token with the session expiry value if a payload is provided with refresh defaulted to false', async () => {
      const payload = { id: 1, email: 'user@example.com', device: 'web' };

      jwtServiceMock.sign.mockReturnValueOnce('generated-token');

      const token = await authSessionService.generateJwtToken(payload);

      expect(token).toBeDefined();
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload, {
        expiresIn: Number(process.env.SESSION_EXPIRY),
        secret: process.env.SESSION_SECRET,
      });
    });

    it('should create a token with the refresh expiry value if a payload is provided with refresh set to true', async () => {
      const payload = { id: 1, email: 'user@example.com', device: 'web' };

      jwtServiceMock.sign.mockReturnValueOnce('generated-token');

      const token = await authSessionService.generateJwtToken(payload, true);

      expect(token).toBeDefined();
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(payload, {
        expiresIn: Number(process.env.REFRESH_EXPIRY),
        secret: process.env.SESSION_SECRET,
      });
    });

    it("should post a session to the caching layer after it's created", async () => {
      const payload = { id: 1, email: 'user@example.com', device: 'web' };

      jwtServiceMock.sign.mockReturnValueOnce('generated-token');

      const token = await authSessionService.generateJwtToken(payload, true);

      expect(token).toBeDefined();

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        expect.stringMatching('user:1:mocked-random-uuid'),
        {
          token,
          device: expect.any(String),
        },
        expect.any(Number)
      );
    });
  });

  describe('verifyJwtToken', () => {
    it('should throw an error if a token is not provided', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        async () => await authSessionService.verifyJwtToken()
      ).rejects.toThrow(new IsEmptyException('auth token'));
    });

    it('should throw an error if the token is not valid', async () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error('invalid jwt token');
      });

      await expect(
        async () => await authSessionService.verifyJwtToken('invalid jwt token')
      ).rejects.toThrow(new BadRequestException('invalid jwt token'));
    });

    it('should throw UnauthorizedException if the token is not found in the cache', async () => {
      const token = 'some-valid-jwt-token';

      cacheManagerMock.store.keys.mockResolvedValue([]);

      const decodedToken = {
        id: 1,
        email: 'johndoe@example.com',
        iat: Date.now() * 1000,
        exp: Date.now() + 60 * 60 * 24 * 1000,
      };

      jest
        .spyOn(authSessionService['jwtService'], 'verify')
        .mockReturnValue(decodedToken);

      await expect(authSessionService.verifyJwtToken(token)).rejects.toThrow(
        UnauthorizedException
      );

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith(
        `user:${decodedToken.id}*`
      );

      expect(authSessionService['jwtService'].verify).toHaveBeenCalledWith(token, {
        secret: process.env.SESSION_SECRET,
      });
    });

    it('should return the decoded token and session ID if the token is successfully verified and found in the cache', async () => {
      const token = 'some-valid-jwt-token';
      const deviceId = 'web';

      const decodedToken = {
        id: 1,
        email: 'johndoe@example.com',
        iat: Date.now() * 1000,
        exp: Date.now() + 60 * 60 * 24 * 1000,
      };

      cacheManagerMock.store.keys.mockResolvedValue([
        `user:${decodedToken.id}:mocked-random-uuid`,
      ]);

      jwtServiceMock.verify.mockReturnValueOnce(decodedToken);

      const cachedSessions = [
        {
          device: deviceId,
          token: 'cached-jwt-token',
        },
      ];

      cacheManagerMock.store.mget.mockResolvedValue(cachedSessions);

      const result = await authSessionService.verifyJwtToken(token, deviceId);

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith(
        `user:${decodedToken.id}*`
      );
      expect(cacheManagerMock.store.mget).toHaveBeenCalledWith(
        `user:${decodedToken.id}:mocked-random-uuid`
      );
      expect(jwtServiceMock.verify).toHaveBeenCalledWith(token, {
        secret: process.env.SESSION_SECRET,
      });
      expect(result).toEqual({
        sessionId: `user:${decodedToken.id}:mocked-random-uuid`,
        decoded: decodedToken,
      });
    });
  });

  describe('postSessionToCache', () => {
    it('should correctly post a session to the cache', async () => {
      const id = 1;
      const token = 'some-jwt-token';
      const device = 'web';
      const expiresIn = 3600; // 1 hour

      await authSessionService.postSessionToCache({
        id: id.toString(),
        token,
        device,
        expiresIn,
      });

      expect(authSessionService['cacheManager'].set).toHaveBeenCalledWith(
        expect.stringMatching('user:1:mocked-random-uuid'),
        {
          device: expect.any(String),
          token: 'generated-token',
        },
        expect.any(Number)
      );
    });
  });

  describe('getSingleSessionFromCach', () => {
    it("should return undefined if there isn't an active session matching the user's id and the current device", async () => {
      const id = 1;
      const device = 'web';

      cacheManagerMock.store.keys.mockResolvedValue([]);

      const result = await authSessionService.getSingleSessionFromCache(id, device);

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith(`user:${id}*`);
      expect(result).toBeUndefined();
    });

    it('should return the matching session if there is an active session for the user and the current device', async () => {
      const id = 1;
      const device = 'web';
      const expectedSession: CachedToken = {
        id: `user:${id}:mocked-random-uuid`,
        device: 'web',
        token: 'some-jwt-token',
      };

      cacheManagerMock.store.keys.mockResolvedValue([`user:${id}:mocked-random-uuid`]);

      cacheManagerMock.store.mget.mockResolvedValue([expectedSession]);

      const result = await authSessionService.getSingleSessionFromCache(id, device);

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith(`user:${id}*`);
      expect(cacheManagerMock.store.mget).toHaveBeenCalledWith(
        `user:${id}:mocked-random-uuid`
      );

      expect(result).toEqual(expectedSession);
    });
  });

  describe('getActiveSessionsFromCache', () => {
    it('should return an empty array if no active sessions are found for the user', async () => {
      const id = 1;

      cacheManagerMock.store.keys.mockResolvedValue([]);

      const result = await authSessionService.getActiveSessionsFromCache(id);

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith(`user:${id}*`);

      expect(result).toEqual([]);
    });

    it('should return an array of active sessions if sessions are found for the user', async () => {
      const id = 1;
      const expectedSessions: CachedToken[] = [
        {
          id: 'user:1:some-session-id-1',
          device: 'web',
          token: 'some-jwt-token-1',
        },
        {
          id: 'user:1:some-session-id-2',
          device: 'mobile',
          token: 'some-jwt-token-2',
        },
      ];

      cacheManagerMock.store.keys.mockResolvedValue([
        'user:1:some-session-id-1',
        'user:1:some-session-id-2',
      ]);

      cacheManagerMock.store.mget.mockResolvedValue(expectedSessions);

      const result = await authSessionService.getActiveSessionsFromCache(id);

      expect(cacheManagerMock.store.keys).toHaveBeenCalledWith(`user:${id}*`);

      expect(cacheManagerMock.store.mget).toHaveBeenCalledWith(
        'user:1:some-session-id-1',
        'user:1:some-session-id-2'
      );

      expect(result).toEqual(expectedSessions);
    });
  });

  describe('deleteActiveSessionFromCache', () => {
    it('should delete the active session from the cache', async () => {
      const id = 1;

      cacheManagerMock.del.mockResolvedValue(undefined);

      await authSessionService.deleteActiveSessionFromCache(id);

      expect(cacheManagerMock.del).toHaveBeenCalledWith(id.toString());
    });

    it('should log and rethrow an error if deletion fails', async () => {
      const id = 1;
      const errorMessage = 'Failed to delete session from cache';

      cacheManagerMock.del.mockRejectedValue(new Error(`[Error: ${errorMessage}]`));

      await expect(authSessionService.deleteActiveSessionFromCache(id)).rejects.toThrow(
        errorMessage
      );

      expect(cacheManagerMock.del).toHaveBeenCalledWith(id.toString());
    });
  });
});
