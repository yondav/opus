// src/prisma/__tests__/prisma.service.test.ts

import { Test, type TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should connect to the database', async () => {
    await prismaService.onModuleInit();

    expect(prismaService.$queryRaw).toBeDefined();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });
});
