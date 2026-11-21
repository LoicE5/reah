import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/db/schema'

declare global {
  var reahPool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required.')

  const pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: true
  })

  pool.on('error', (error: Error) => {
    console.error('[db] Idle PostgreSQL connection failed:', error.message)
  })

  return pool
}

// Reuse the pool in each process, including during Next.js hot reloads.
const pool = globalThis.reahPool ??= createPool()

export const db = drizzle(pool, { schema })
export type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
