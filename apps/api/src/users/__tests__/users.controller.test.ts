// src/users/__tests__/users.controller.test.ts

import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma';
import { ApiResponse } from '../../utils';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock;
  let prismaServiceMock;

  const validToken =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QxQHRlc3QuY29tIiwiaWQiOjY3LCJkZXZpY2UiOiJpbnNvbW5pYS84LjQuMCIsImlhdCI6MTcwNjkwMTUzNSwiZXhwIjoxNzA2OTg3OTM1fQ.5INF0_4ZzGg4SfdTx2PWlzVwq6GUyxF0kghp4KCqCsU';

  beforeEach(async () => {
    prismaServiceMock = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    usersServiceMock = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      deleteUser: jest.fn(),
      createUser: jest.fn(),
      editUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
      ];

      controller['request'] = { headers: { authorization: validToken } };

      (usersServiceMock.getAllUsers as jest.Mock).mockResolvedValueOnce(
        ApiResponse.success(mockUsers, 'Operation successful')
      );

      const result = await controller.getAllUsers();
      expect(result).toEqual(ApiResponse.success(mockUsers, 'Operation successful'));
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: 1, email: 'user1@example.com' };

      controller['request'] = { headers: { authorization: validToken } };

      (usersServiceMock.getUserById as jest.Mock).mockResolvedValueOnce(
        ApiResponse.success(mockUser, 'Operation successful')
      );

      const result = await controller.getUserById('1');
      expect(result).toEqual(ApiResponse.success(mockUser, 'Operation successful'));
    });
  });

  describe('editUser', () => {
    it('should edit a user by ID', async () => {
      const mockEditedUser = { id: 1, email: 'editeduser@example.com' };

      controller['request'] = { headers: { authorization: validToken } };

      (usersServiceMock.editUser as jest.Mock).mockResolvedValueOnce(
        ApiResponse.success(mockEditedUser, 'Operation successful')
      );

      const result = await controller.editUser('1', { email: 'editeduser@example.com' });
      expect(result).toEqual(ApiResponse.success(mockEditedUser, 'Operation successful'));
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      controller['request'] = { headers: { authorization: validToken } };

      (usersServiceMock.deleteUser as jest.Mock).mockResolvedValueOnce(
        ApiResponse.success(null, 'Operation successful')
      );

      const result = await controller.deleteUser('1');
      expect(result).toEqual(ApiResponse.success(null, 'Operation successful'));
    });
  });
});
