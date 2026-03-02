import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '@/db/schema'

// Singleton pattern — prevents multiple connections during Next.js dev hot reloads
const globalForDb = globalThis as unknown as { _reahPool: mysql.Pool | undefined }

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const pool =
  globalForDb._reahPool ??
  mysql.createPool({
    host:     process.env.DB_HOST ?? 'localhost',
    port:     Number(process.env.DB_PORT ?? 3306),
    user:     requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    waitForConnections: true,
    connectionLimit:    10,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb._reahPool = pool
}

export const db = drizzle(pool, { schema, mode: 'default' })
