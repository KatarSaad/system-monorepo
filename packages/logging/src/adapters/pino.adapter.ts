import { Injectable } from '@nestjs/common';
// import * as pino from 'pino';

@Injectable()
export class PinoAdapter {
  private logger: any;

  constructor() {
    this.logger = console;
  }

  log(level: string, message: string, meta?: any): void {
    console.log(`[${level.toUpperCase()}] ${message}`, meta);
  }
}