import type { ApiSuccess } from '@/types/api'
import type {
  Kendaraan,
  KendaraanListParams,
  KendaraanPayload,
  KondisiKendaraan,
} from '@/types/models'
import { createCrudApi } from './crud'
import { http } from './http'

export const kendaraanApi = {
  ...createCrudApi<Kendaraan, Kendaraan, KendaraanPayload, KendaraanListParams>('/kendaraan'),
  async updateKondisi(id: string, kondisi: KondisiKendaraan): Promise<Kendaraan> {
    const { data } = await http.patch<ApiSuccess<Kendaraan>>(`/kendaraan/${id}/kondisi`, {
      kondisi,
    })
    return data.data
  },
}
