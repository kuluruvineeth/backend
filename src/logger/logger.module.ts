import { Global, Module } from '@nestjs/common';
import { ISOLogger } from './isoLogger.service';

@Global()
@Module({
  providers: [ISOLogger],
  exports: [ISOLogger],
})
export class LoggerModule {}
