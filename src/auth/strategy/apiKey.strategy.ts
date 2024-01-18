import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';
import { ISOLogger } from 'src/logger/isoLogger.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(
    private authService: AuthService,
    private logger: ISOLogger,
  ) {
    logger.setContext(ApiKeyStrategy.name);
    super(
      { header: 'X-API-KEY', prefix: '' },
      true,
      async (
        apiKey: string,
        done: (err: Error | unknown, verified?: boolean) => void,
      ) => {
        const isValidApiKey = await this.authService.validateApiKey(apiKey);
        if (isValidApiKey) {
          return done(null, true);
        } else {
          this.logger.warn('invalid API key');
          return done(new UnauthorizedException(), false);
        }
      },
    );
  }
}
