import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/db/schema'

declare global {
  var reahPool: Pool | undefined
}

function createPool(): Pool {
  let connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required.')
  const ca = process.env.DATABASE_CA_CERT
  if (ca) {
    if (!URL.canParse(connectionString)) throw new Error('DATABASE_URL must be a valid PostgreSQL URI.')
    const url = new URL(connectionString)
    const parameters = url.searchParams
    // node-postgres replaces explicit TLS settings when the URI supplies its own.
    const sslModes = parameters.getAll('sslmode')
    if (sslModes.length === 1 && sslModes[0] === 'require') {
      parameters.delete('sslmode')
      connectionString = url.href
    }
    if (['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslnegotiation'].some(parameter => parameters.has(parameter))) {
      throw new Error('Conflicting TLS parameters in DATABASE_URL. With DATABASE_CA_CERT, use sslmode=require or omit TLS parameters.')
    }
  }

  const pool = new Pool({
    connectionString,
    ...(ca && { ssl: { ca, rejectUnauthorized: true } }),
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
