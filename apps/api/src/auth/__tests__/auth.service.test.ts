// src/auth/__tests__/auth.service.test.ts

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';

import { UsersService } from '../../users';
import {
  ApiResponse,
  BadRequestException,
  IsEmptyException,
  NotFoundException,
  UnauthorizedException,
} from '../../utils';
import { AuthService } from '../auth.service';
import { AuthSessionService } from '../auth.session.service';

jest.mock('bcrypt');

const authSessionServiceMock = {
  generateJwtToken: jest.fn(),
  verifyJwtToken: jest.fn(),
  postSessionToCache: jest.fn(),
  getActiveSessionsFromCache: jest.fn(),
  getSingleSessionFromCache: jest.fn(),
  deleteActiveSessionFromCache: jest.fn(),
};

const usersServiceMock = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  getUserById: jest.fn(),
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

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthSessionService,
          useValue: authSessionServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should throw an error if the user was not found', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersServiceMock.getUserByEmail.mockReturnValue(
        ApiResponse.fromException(new NotFoundException(`user ${mockData.email}`))
      );

      const asyncFunction = async () => {
        await authService.validateUser(mockData.email, mockData.password);
      };

      await expect(asyncFunction).rejects.toThrow(NotFoundException); // expect(result).toThrow(NotFoundException);
    });

    it('should return null if password is invalid', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersServiceMock.getUserByEmail.mockReturnValue(
        ApiResponse.success({
          id: 1,
          email: mockData.email,
          password: 'Password!123',
        })
      );

      const result = await authService.validateUser(mockData.email, mockData.password);

      expect(result).toBeFalsy();
      expect(result).toEqual(null);
    });

    it('should return a valid user', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'Password!123',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      usersServiceMock.getUserByEmail.mockReturnValue(
        ApiResponse.success({
          id: 1,
          email: mockData.email,
          password: 'Password!123',
        })
      );

      const result = await authService.validateUser(mockData.email, mockData.password);

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenLastCalledWith(
        mockData.password,
        mockData.password
      );
      expect(result).toEqual(ApiResponse.success({ id: 1, ...mockData }));
    });
  });

  describe('createUser', () => {
    it('should return an error if the user info is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await authService.createUser();

      expect(result).toEqual(
        ApiResponse.error(
          new IsEmptyException('registration data'),
          'registration data must be provided'
        )
      );
    });

    it('should return an error if user already exists', async () => {
      const existingUser = {
        id: 1,
        email: 'johndoe@example.com',
        password: 'password',
      };

      usersServiceMock.getUserByEmail.mockReturnValue(ApiResponse.success(existingUser));

      const result = await authService.createUser({
        email: existingUser.email,
        password: existingUser.password,
      });

      expect(result).toEqual(
        ApiResponse.fromException(
          new UnauthorizedException(`account already exists for ${existingUser.email}`)
        )
      );
    });

    it('should hash the provided password and create a new user', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersServiceMock.getUserByEmail.mockReturnValue(
        ApiResponse.fromException(new NotFoundException(`user ${mockData.email}`))
      );

      usersServiceMock.createUser.mockReturnValue(
        ApiResponse.success({ id: 1, ...mockData })
      );

      const result = await authService.createUser(mockData);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockData.password, 10);
      expect(result).toEqual(ApiResponse.success({ id: 1, ...mockData }));
    });
  });

  describe('localSignup', () => {
    it('should return an error if the user info is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await authService.localSignup();

      expect(result).toEqual(
        ApiResponse.error(
          new IsEmptyException('registration data'),
          'registration data must be provided'
        )
      );
    });

    it("should return an error if the provided password and passwordMatch aren't equal values", async () => {
      const userInfo = {
        email: 'johndoe@example.com',
        password: 'password!123',
        passwordMatch: 'Password!123',
      };

      const result = await authService.localSignup({} as Request, userInfo);

      expect(result).toEqual(
        ApiResponse.error(
          new BadRequestException("password and confirmation password don't match"),
          "password and confirmation password don't match"
        )
      );
    });

    it('should return an error if user already exists', async () => {
      const existingUser = {
        email: 'johndoe@example.com',
        password: 'password',
      };

      jest
        .spyOn(authService, 'createUser')
        .mockResolvedValueOnce(
          ApiResponse.fromException(
            new UnauthorizedException(`account already exists for ${existingUser.email}`)
          )
        );

      const result = await authService.localSignup({} as Request, {
        ...existingUser,
        passwordMatch: existingUser.password,
      });

      expect(result).toEqual(
        ApiResponse.fromException(
          new UnauthorizedException(`account already exists for ${existingUser.email}`)
        )
      );
    });

    it('should create a new user, log in, and return ApiResponse<UserWithToken>', async () => {
      const createUserResponse = ApiResponse.success({
        id: 1,
        email: 'test@example.com',
        password: 'testpassword',
      });

      jest.spyOn(authService, 'createUser').mockResolvedValue(createUserResponse);

      const localLoginResponse = ApiResponse.success({
        ...createUserResponse.data,
        access_token: 'generated token',
      });

      jest.spyOn(authService, 'localLogin').mockResolvedValue(localLoginResponse);

      const req = { headers: {} } as Request;

      const registrationData = {
        email: 'test@example.com',
        password: 'password',
        passwordMatch: 'password',
      };

      const result = await authService.localSignup(req, registrationData);

      const expectedApiResponse = ApiResponse.success(
        {
          id: 1,
          email: 'test@example.com',
          password: 'testpassword', // Include the password field in the expectation
          access_token: 'generated token',
        },
        'user test@example.com account successfully created and authenticated'
      );

      expect(authService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(authService.localLogin).toHaveBeenCalledWith(createUserResponse, {});
      expect(result).toEqual(expectedApiResponse);
    });
  });

  describe('localLogin', () => {
    it('should successfully log in and return ApiResponse<UserWithToken>', async () => {
      const userId = 1;
      const userEmail = 'user@example.com';
      const userPassword = 'password';
      const userAgent = 'web';

      const userResponse = {
        success: true,
        data: {
          id: userId,
          email: userEmail,
          password: userPassword,
        },
        error: null,
        message: '',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(userResponse);

      usersServiceMock.getUserById.mockReturnValue(userResponse);

      const accessToken = 'mocked-access-token';

      authSessionServiceMock.generateJwtToken.mockResolvedValue(accessToken);

      const reqUser = {
        data: {
          id: userId,
          email: userEmail,
        },
      };

      const headers = {
        'user-agent': userAgent,
      };

      const result = await authService.localLogin(reqUser, headers);

      expect(usersServiceMock.getUserById).toHaveBeenCalledWith(userId);
      expect(authSessionServiceMock.generateJwtToken).toHaveBeenCalledWith({
        email: userEmail,
        id: userId,
        device: userAgent,
      });
      expect(result).toEqual(
        ApiResponse.success(
          {
            ...userResponse.data,
            access_token: accessToken,
          },
          `user ${userEmail} logged in`
        )
      );
    });
  });

  describe('localLogout', () => {
    it('should delete the active session from cache and return success response', async () => {
      const userId = 1;

      const result = await authService.localLogout(userId);

      expect(authSessionServiceMock.deleteActiveSessionFromCache).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(ApiResponse.success(null, `user ${userId} logged out`));
    });

    it('should return an error response if an exception occurs during session deletion', async () => {
      const userId = 1;
      const errorMessage = 'Some error message';

      authSessionServiceMock.deleteActiveSessionFromCache.mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await authService.localLogout(userId);

      expect(authSessionServiceMock.deleteActiveSessionFromCache).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(ApiResponse.error(new Error(errorMessage)));
    });
  });
});
