import { Test, type TestingModule } from '@nestjs/testing';
import type { Request } from 'express';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import type * as Dto from '../dtos';

jest.mock('../auth.service');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('local/signup', () => {
    it('should signup a local user', async () => {
      const mockRequest: Request = {} as Request;
      const mockSignupData: Dto.Signup = {
        email: 'test@example.com',
        password: 'Password!123',
        passwordMatch: 'Password!123',
      };

      const mockAuthServiceResponse = {
        success: true,
        data: {
          id: 1,
          email: mockSignupData.email,
          password: mockSignupData.password,
          access_token: 'generated-token',
        },
        error: null,
        message: `user ${mockSignupData.email} account successfully created and authenticated`,
      };

      jest
        .spyOn(authService, 'localSignup')
        .mockResolvedValueOnce(mockAuthServiceResponse);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { password, ...rest } = mockAuthServiceResponse.data;

      const result = await controller.signup(mockRequest, mockSignupData);
      expect(authService.localSignup).toHaveBeenCalledWith(mockRequest, mockSignupData);
      expect(result).toEqual({
        ...mockAuthServiceResponse,
        data: rest,
      });
    });
  });

  describe('local/signin', () => {
    it('should login a local user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'Password!123',
      };

      const mockRequest: Request = {
        user: mockUser,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X',
        },
      } as unknown as Request;

      const mockAuthServiceResponse = {
        success: true,
        data: { ...mockUser, access_token: 'generated-token' },
        error: null,
        message: `user test@example.com logged in`,
      };

      jest
        .spyOn(authService, 'localLogin')
        .mockResolvedValueOnce(mockAuthServiceResponse);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const { password, ...rest } = mockAuthServiceResponse.data;

      const result = await controller.login(mockRequest);
      expect(authService.localLogin).toHaveBeenCalledWith(
        mockRequest.user,
        mockRequest.headers
      );
      expect(result).toEqual({
        ...mockAuthServiceResponse,
        data: rest,
      });
    });
  });

  describe('local/signout', () => {
    it('should logout a local user', async () => {
      const mockUserId = '1';

      const mockAuthServiceResponse = {
        success: true,
        data: null,
        error: null,
        message: `user ${mockUserId} logged out`,
      };

      jest
        .spyOn(authService, 'localLogout')
        .mockResolvedValueOnce(mockAuthServiceResponse);

      const result = await controller.logout(mockUserId);
      expect(authService.localLogout).toHaveBeenCalledWith(Number(mockUserId));
      expect(result).toEqual(mockAuthServiceResponse);
    });
  });
});
