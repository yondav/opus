import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  // Create a testing module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  // Test case 1: Check if PrismaService instance is defined
  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  // Test case 2: Check if PrismaService successfully connects to the database
  it('should connect to the database', async () => {
    // Ensure that the connection is established
    await prismaService.onModuleInit();

    // Expect that the Prisma client instance is defined
    expect(prismaService.$queryRaw).toBeDefined();
  });

  // Cleanup: Close the Prisma client connection after all tests
  afterAll(async () => {
    await prismaService.$disconnect();
  });
});
