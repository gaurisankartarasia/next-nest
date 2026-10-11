#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b066708be70fcc4e548b62dbdd61f4c8180035f52629ccaeb2a6a69b90361867/contract';
import startContract from '../../snapshots/b066708be70fcc4e548b62dbdd61f4c8180035f52629ccaeb2a6a69b90361867/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c724755d59f4a085a65955fe63d3b7929f6abc8f1f732bcd94c2cb05b68a6c35/contract';
import endContract from '../../snapshots/c724755d59f4a085a65955fe63d3b7929f6abc8f1f732bcd94c2cb05b68a6c35/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';
import postgres from '@prisma/orm-postgres/runtime';

const { sql: db, contract } = postgres<End>({ contractJson: endContract });

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
      this.addColumn({
        schema: 'public',
        table: 'users',
        column: col('pid', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(contract, 'backfill-users-pid', {
        check: () => db.public.users.select('id').where((f, fns) => fns.eq(f.pid, null)).limit(1),
        run: () => db.public.users.update({ pid: lit('gen_random_uuid()') }).where((f, fns) => fns.eq(f.pid, null)),
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
