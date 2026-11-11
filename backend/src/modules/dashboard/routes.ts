import { Elysia } from 'elysia'
import { ok } from '../../lib/response'
import { errorResponses, success } from '../../lib/schemas'
import { DashboardModel } from './model'
import { dashboardService } from './service'

export const dashboardRoutes = new Elysia({ prefix: '/dashboard', tags: ['Dashboard'] }).get(
  '/ringkasan',
  async () => ok(await dashboardService.ringkasan()),
  {
    response: { 200: success(DashboardModel.ringkasan), 500: errorResponses[500] },
    detail: { summary: 'Angka ringkasan + rekap kondisi kendaraan per perangkat daerah' },
  },
)
