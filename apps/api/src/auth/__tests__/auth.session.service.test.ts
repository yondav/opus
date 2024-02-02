// src/auth/__tests__/auth.session.service.test.ts

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';

import { IsEmptyException } from '../../utils';
import { AuthSessionService } from '../auth.session.service';

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

    it("should post a session to the cacheing layer after it's created", async () => {
      const payload = { id: 1, email: 'user@example.com', device: 'web' };

      jwtServiceMock.sign.mockReturnValueOnce('generated-token');

      const token = await authSessionService.generateJwtToken(payload, true);

      expect(token).toBeDefined();
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        expect.stringMatching(/user:1:[\da-f-]+/),
        {
          token,
          device: 'web',
        },
        expect.any(Number)
      );
    });
  });
});
