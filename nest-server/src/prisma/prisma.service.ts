import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { db } from './db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = db;

  async onModuleInit() {
    // Connection is lazily initialized on first query
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}

