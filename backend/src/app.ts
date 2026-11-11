import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { env } from './config/env'
import { errorHandler } from './lib/error-handler'
import { dashboardRoutes } from './modules/dashboard/routes'
import { healthRoutes } from './modules/health'
import { kendaraanRoutes } from './modules/kendaraan/routes'
import { pegawaiRoutes } from './modules/pegawai/routes'
import { perangkatDaerahRoutes } from './modules/perangkat-daerah/routes'

/** Router API versi 1. */
export const apiV1 = new Elysia({ prefix: '/api/v1' })
  .use(healthRoutes)
  .use(perangkatDaerahRoutes)
  .use(pegawaiRoutes)
  .use(kendaraanRoutes)
  .use(dashboardRoutes)

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
          tags: [
            { name: 'Perangkat Daerah', description: 'Instansi pemilik/pengguna kendaraan' },
            { name: 'Pegawai', description: 'Pegawai & penanggung jawab kendaraan' },
            { name: 'Kendaraan Dinas', description: 'Data kendaraan dinas operasional' },
            { name: 'Dashboard', description: 'Ringkasan kondisi kendaraan' },
            { name: 'Health', description: 'Status layanan' },
          ],
        },
      }),
    )
    .get('/', ({ redirect }) => redirect('/docs'), { detail: { hide: true } })
    .use(apiV1)
}

export type App = ReturnType<typeof createApp>
