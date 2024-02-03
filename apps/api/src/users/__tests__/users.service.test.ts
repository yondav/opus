// src/users/__tests__/users.service.test.ts

import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma';
import {
  ApiResponse,
  IsEmptyException,
  NotFoundException,
  UnauthorizedException,
} from '../../utils';
import { UsersService } from '../users.service';

const prismaServiceMock = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  describe('getAllUsers', () => {
    it('should return an error if an id is not provided', async () => {
      prismaServiceMock.user.findMany.mockResolvedValueOnce([
        {
          id: 1,
          email: 'jondoe@example.com',
          password: 'nlscdnkldnfie932n#',
        },
      ]);

      const result = await userService.getAllUsers();
      expect(result).toEqual(
        ApiResponse.success(
          [
            {
              id: 1,
              email: 'jondoe@example.com',
              password: 'nlscdnkldnfie932n#',
            },
          ],
          'All users retrieved successfully'
        )
      );
    });

    it('should return an error if users are not found', async () => {
      prismaServiceMock.user.findMany.mockResolvedValueOnce(null);

      const result = await userService.getAllUsers();
      expect(result).toEqual(
        ApiResponse.error(new NotFoundException('users'), 'users not found')
      );
    });
  });

  describe('getUserById', () => {
    it('should return an error if an id is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await userService.getUserById();
      expect(result).toEqual(
        ApiResponse.error(new IsEmptyException('id'), 'id must be provided')
      );
    });

    it('should return a user if found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'johndoe@example.com',
        password: 'nlscdnkldnfie932n',
      });

      const result = await userService.getUserById(1);
      expect(result).toEqual(
        ApiResponse.success(
          {
            id: 1,
            email: 'johndoe@example.com',
            password: 'nlscdnkldnfie932n',
          },
          'user 1 retrieved successfully'
        )
      );
    });

    it('should return an error if user is not found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValueOnce(null);

      const result = await userService.getUserById(1);
      expect(result).toEqual(ApiResponse.error(new NotFoundException('user 1')));
    });
  });

  describe('getUserByEmail', () => {
    it('should return an error if an email is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await userService.getUserByEmail();
      expect(result).toEqual(
        ApiResponse.error(new IsEmptyException('email'), 'email must be provided')
      );
    });

    it('should return a user if found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'johndoe@example.com',
        password: 'nlscdnkldnfie932n',
      });

      const result = await userService.getUserByEmail('johndoe@example.com');
      expect(result).toEqual(
        ApiResponse.success(
          { id: 1, email: 'johndoe@example.com', password: 'nlscdnkldnfie932n' },
          'user johndoe@example.com retrieved successfully'
        )
      );
    });

    it('should return an error if user is not found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValueOnce(null);

      const result = await userService.getUserByEmail('johndoe@example.com');
      expect(result).toEqual(
        ApiResponse.error(new NotFoundException('user johndoe@example.com'))
      );
    });
  });

  describe('deleteUser', () => {
    it('should return an error if an id is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await userService.deleteUser();
      expect(result).toEqual(
        ApiResponse.error(new IsEmptyException('id'), 'id must be provided')
      );
    });

    it('should return an error if user is not found', async () => {
      jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValueOnce(ApiResponse.error(new NotFoundException('user 1')));

      const result = await userService.deleteUser(1);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(ApiResponse.error(new NotFoundException('user 1')));
    });

    it('should delete the user if found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValueOnce(
        ApiResponse.success({
          id: 1,
          email: 'johndoe@example.com',
          password: 'nlscdnkldnfie932n',
        })
      );

      prismaServiceMock.user.delete.mockResolvedValueOnce({ id: 1 });

      const result = await userService.deleteUser(1);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(ApiResponse.success(null, 'user 1 deleted successfully'));
    });
  });

  describe('createUser', () => {
    it('should return an error if a data object is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await userService.createUser();
      expect(result).toEqual(
        ApiResponse.error(
          new IsEmptyException('registration data'),
          'registration data must be provided'
        )
      );
    });

    it('should return an error if existing user is found', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValueOnce(
        ApiResponse.success(
          {
            id: 1,
            email: 'johndoe@example.com',
            password: 'nlscdnkldnfie932n',
          },
          'user johndoe@example.com retrieved successfully'
        )
      );

      const result = await userService.createUser({
        email: 'johndoe@example.com',
        password: 'nlscdnkldnfie932n',
      });

      expect(userService.getUserByEmail).toHaveBeenCalledWith('johndoe@example.com');
      expect(result).toEqual(
        ApiResponse.error(
          new UnauthorizedException('account already exists for johndoe@example.com')
        )
      );
    });

    it('should create user if existing user is not found', async () => {
      jest
        .spyOn(userService, 'getUserByEmail')
        .mockResolvedValueOnce(
          ApiResponse.error(new NotFoundException('user johndoe@example.com'))
        );

      prismaServiceMock.user.create.mockResolvedValueOnce({
        id: 1,
        email: 'johndoe@example.com',
        password: 'nlscdnkldnfie932n',
      });

      const result = await userService.createUser({
        email: 'johndoe@example.com',
        password: 'nlscdnkldnfie932n',
      });

      expect(userService.getUserByEmail).toHaveBeenCalledWith('johndoe@example.com');
      expect(result).toEqual(
        ApiResponse.success(
          {
            id: 1,
            email: 'johndoe@example.com',
            password: 'nlscdnkldnfie932n',
          },
          'user johndoe@example.com created successfully'
        )
      );
    });
  });

  describe('editUser', () => {
    it('should return an error if id is not provided', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      const result = await userService.editUser();
      expect(result).toEqual(
        ApiResponse.error(new IsEmptyException('id'), 'id must be provided')
      );
    });

    it('should return an error if user is not found', async () => {
      jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValueOnce(ApiResponse.error(new NotFoundException('user 1')));

      const result = await userService.editUser(1, {});

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(ApiResponse.error(new NotFoundException('user 1')));
    });

    it('should update the user if found', async () => {
      jest.spyOn(userService, 'getUserById').mockResolvedValueOnce(
        ApiResponse.success({
          id: 1,
          email: 'johndoe@example.com',
          password: 'nlscdnkldnfie932n',
        })
      );

      prismaServiceMock.user.update.mockResolvedValueOnce({
        id: 1,
        email: 'johndoethegreat@example.com',
        password: 'nlscdnkldnfie932n',
      });

      const result = await userService.editUser(1, {
        email: 'johndoethegreat@example.com',
      });

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        ApiResponse.success(
          { id: 1, email: 'johndoethegreat@example.com', password: 'nlscdnkldnfie932n' },
          'user 1 successfully modified'
        )
      );
    });
  });
});
