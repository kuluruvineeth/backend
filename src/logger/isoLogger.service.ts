import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class ISOLogger extends ConsoleLogger {
  constructor(private configService: ConfigService) {
    super('default', { timestamp: true });
    this.setLogLevels(['log', 'warn', 'error', 'debug']);
  }

  protected getTimestamp(): string {
    return new Date().toISOString();
  }
}
