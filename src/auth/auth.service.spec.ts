import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@/database/prisma.service';
import { ApiKey } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  const apiKeyMock = { id: 'b2edb9e5-8999-4aca-af65-6deacfd1bb9a' } as ApiKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            apiKey: {
              findUnique: jest.fn().mockResolvedValue(apiKeyMock),
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateApiKey()', () => {
    it('should return false if the api key is in invalid format', async () => {
      prismaService.apiKey.findUnique = jest.fn().mockResolvedValue(null);

      const apiKey = 'invalid-api-key-format';

      const result = await authService.validateApiKey(apiKey);

      expect(prismaService.apiKey.findUnique).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false if the api key does not exists', async () => {
      prismaService.apiKey.findUnique = jest.fn().mockResolvedValue(null);

      const apiKey = 'b2edb9e5-8999-4aca-af65-6deacfd1bb9b';

      const result = await authService.validateApiKey(apiKey);

      expect(prismaService.apiKey.findUnique).toHaveBeenCalledWith({
        id: apiKey,
      });
      expect(result).toBe(false);
    });

    it('should return true if the api key exists', async () => {
      prismaService.apiKey.findUnique = jest.fn().mockResolvedValue(apiKeyMock);

      const result = await authService.validateApiKey(apiKeyMock.id);

      expect(prismaService.apiKey.findUnique).toHaveBeenCalledWith({
        id: apiKeyMock.id,
      });
      expect(result).toBe(true);
    });
  });
});
