import { Injectable } from '@nestjs/common';
// import * as winston from 'winston';

@Injectable()
export class WinstonAdapter {
  private logger: any;

  constructor() {
    this.logger = console;
  }

  log(level: string, message: string, meta?: any): void {
    console.log(`[${level.toUpperCase()}] ${message}`, meta);
  }
}