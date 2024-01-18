import { Injectable, NestMiddleware } from '@nestjs/common';
import { ISOLogger } from './isoLogger.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: ISOLogger) {
    this.logger.setContext('HTTP Request');
  }

  use(req: Request, _res: Response, next: NextFunction) {
    this.logger.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
