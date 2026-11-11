import type { ApiSuccess, HealthStatus } from '@/types/api'
import { http } from './http'

export const healthApi = {
  async check(): Promise<HealthStatus> {
    const { data } = await http.get<ApiSuccess<HealthStatus>>('/health')
    return data.data
  },
}
