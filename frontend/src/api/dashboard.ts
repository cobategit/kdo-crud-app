import type { ApiSuccess } from '@/types/api'
import type { DashboardRingkasan } from '@/types/models'
import { http } from './http'

export const dashboardApi = {
  async ringkasan(): Promise<DashboardRingkasan> {
    const { data } = await http.get<ApiSuccess<DashboardRingkasan>>('/dashboard/ringkasan')
    return data.data
  },
}
