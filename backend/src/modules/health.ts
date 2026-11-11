import { sql } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db } from '../db/client'

export const healthRoutes = new Elysia({ tags: ['Health'] }).get(
  '/health',
  async ({ set }) => {
    const started = performance.now()
    try {
      await db.execute(sql`select 1`)
      return {
        success: true as const,
        data: {
          status: 'ok' as const,
          database: 'ok' as const,
          latency_ms: Math.round(performance.now() - started),
          waktu: new Date().toISOString(),
        },
      }
    } catch {
      set.status = 503
      return {
        success: false as const,
        error: { code: 'KESALAHAN_SERVER' as const, message: 'Database tidak dapat dihubungi' },
      }
    }
  },
  {
    detail: { summary: 'Health check (termasuk koneksi database)' },
    response: {
      200: t.Object({
        success: t.Literal(true),
        data: t.Object({
          status: t.Literal('ok'),
          database: t.Literal('ok'),
          latency_ms: t.Number(),
          waktu: t.String(),
        }),
      }),
      503: t.Object({
        success: t.Literal(false),
        error: t.Object({ code: t.Literal('KESALAHAN_SERVER'), message: t.String() }),
      }),
    },
  },
)
