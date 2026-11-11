import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { env } from './config/env'
import { errorHandler } from './lib/error-handler'
import { healthRoutes } from './modules/health'

/** Router API versi 1. Modul entitas didaftarkan di sini per fase. */
export const apiV1 = new Elysia({ prefix: '/api/v1' }).use(healthRoutes)

export function createApp() {
  return new Elysia()
    .use(errorHandler)
    .use(
      cors({
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    )
    .use(
      openapi({
        path: '/docs',
        documentation: {
          info: {
            title: 'API Pengelolaan Kendaraan Dinas Operasional (KDO)',
            version: '1.0.0',
            description:
              'REST API untuk pendataan kendaraan dinas operasional, pegawai penanggung jawab, dan perangkat daerah.',
          },
          tags: [{ name: 'Health', description: 'Status layanan' }],
        },
      }),
    )
    .get('/', ({ redirect }) => redirect('/docs'), { detail: { hide: true } })
    .use(apiV1)
}

export type App = ReturnType<typeof createApp>
