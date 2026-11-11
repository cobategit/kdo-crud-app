import { defineStore } from 'pinia'
import { toApiError } from '@/api/http'
import { kendaraanApi } from '@/api/kendaraan'
import type { Kendaraan, KendaraanListParams, KondisiKendaraan } from '@/types/models'
import { useCrudState } from './crud'
import { useDashboardStore } from './dashboard'

export const useKendaraanStore = defineStore('kendaraan', () => {
  const crud = useCrudState(kendaraanApi, {
    defaultFilters: { page: 1, per_page: 10, sort: 'nomor_polisi' } as KendaraanListParams,
    // Dashboard di-refresh setelah ada perubahan data kendaraan
    onMutated: () => useDashboardStore().invalidate(),
  })

  /** Ubah kondisi saja (PATCH) lalu perbarui item secara lokal tanpa memuat ulang list. */
  async function updateKondisi(id: string, kondisi: KondisiKendaraan): Promise<Kendaraan> {
    try {
      const updated = await kendaraanApi.updateKondisi(id, kondisi)
      crud.items.value = crud.items.value.map((k) => (k.id === id ? updated : k))
      if (crud.current.value?.id === id) crud.current.value = updated
      useDashboardStore().invalidate()
      return updated
    } catch (e) {
      throw toApiError(e)
    }
  }

  return { ...crud, updateKondisi }
})
