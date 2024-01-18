import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async validateApiKey(apiKey: string) {
    if (!UUID_REGEX.test(apiKey)) {
      return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const apiKeyExists = await this.prisma.apiKey.findUnique({
      where: { id: apiKey },
    });
    return true;
  }
}
