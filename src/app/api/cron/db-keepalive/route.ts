import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { db } = await import('@/lib/db')

    await db.execute(sql`SELECT 1 AS keepalive`)

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error('Database keepalive failed', error)

    return NextResponse.json(
      { error: 'Database keepalive failed' },
      { status: 503 },
    )
  }
}
