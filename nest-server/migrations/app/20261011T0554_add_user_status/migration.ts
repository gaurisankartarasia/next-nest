#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b066708be70fcc4e548b62dbdd61f4c8180035f52629ccaeb2a6a69b90361867/contract';
import startContract from '../../snapshots/b066708be70fcc4e548b62dbdd61f4c8180035f52629ccaeb2a6a69b90361867/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b6cece46ca3f8f4084bfa6e90dbb215c484e17d978b130a3e4432b9e0dda13f6/contract';
import endContract from '../../snapshots/b6cece46ca3f8f4084bfa6e90dbb215c484e17d978b130a3e4432b9e0dda13f6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('status', 'text', {
          notNull: true,
          default: lit('ACTIVE'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
