import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategy/apiKey.strategy';
import { PrismaService } from '@/database/prisma.service';

@Module({
  imports: [PassportModule],
  providers: [AuthService, PrismaService, ApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}
