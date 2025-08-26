# Prisma Database Adapter

A modular adapter that plugs Prisma into the `DatabaseAdapter` interface from `@system/core`.

## Install
```bash
npm install @prisma/client
```

## Usage
```ts
import { PrismaClient } from '@prisma/client';
import { PrismaDatabaseAdapter } from '@system/infrastructure';

const prisma = new PrismaClient();
const db = new PrismaDatabaseAdapter(prisma, {
  enableLogging: true,
  onQueryLog: (q, p) => console.log('SQL:', q, p),
  onError: (e) => console.error('DB error:', e),
});

await db.connect();
const result = await db.executeQuery('SELECT 1 as ok');
await db.disconnect();
```

## API
- `constructor(prisma: PrismaClient, options?: PrismaAdapterOptions)`
- `connect(): Promise<Result<void>>`
- `disconnect(): Promise<Result<void>>`
- `isConnected(): boolean`
- `executeQuery<T>(query: string, params?: any[]): Promise<Result<T[]>>`
- `executeTransaction<T>(operations: (() => Promise<T>)[]): Promise<Result<T[]>>`

## Options
- `enableLogging?: boolean` — toggle simple log hook
- `onQueryLog?: (query: string, params?: any[]) => void` — custom query logger
- `onError?: (error: unknown) => void` — central error hook

## Notes
- Keep domain logic out of the adapter. Use repositories to map models.
- Add additional helpers (mappers, model-specific repos) in your services.
