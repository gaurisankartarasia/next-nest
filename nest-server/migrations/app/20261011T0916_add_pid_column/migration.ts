#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b6cece46ca3f8f4084bfa6e90dbb215c484e17d978b130a3e4432b9e0dda13f6/contract';
import startContract from '../../snapshots/b6cece46ca3f8f4084bfa6e90dbb215c484e17d978b130a3e4432b9e0dda13f6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c724755d59f4a085a65955fe63d3b7929f6abc8f1f732bcd94c2cb05b68a6c35/contract';
import endContract from '../../snapshots/c724755d59f4a085a65955fe63d3b7929f6abc8f1f732bcd94c2cb05b68a6c35/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('pid', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-users-pid', {
        check: () => placeholder('backfill-users-pid:check'),
        run: () => placeholder('backfill-users-pid:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'users', column: 'pid' }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_pid_key',
        columns: ['pid'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
