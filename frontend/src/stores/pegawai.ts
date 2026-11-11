import { defineStore } from 'pinia'
import { pegawaiApi } from '@/api/pegawai'
import type { PegawaiListParams } from '@/types/models'
import { useCrudState } from './crud'
import { useDashboardStore } from './dashboard'

export const usePegawaiStore = defineStore('pegawai', () => {
  const crud = useCrudState(pegawaiApi, {
    defaultFilters: { page: 1, per_page: 10, sort: 'nama' } as PegawaiListParams,
    onMutated: () => useDashboardStore().invalidate(),
  })

  /** Opsi penanggung jawab: pegawai dari satu perangkat daerah, dengan pencarian. */
  async function fetchOptions(perangkatDaerahId: string, search = '') {
    const { items } = await pegawaiApi.list({
      perangkat_daerah_id: perangkatDaerahId,
      search: search || undefined,
      per_page: 50,
      sort: 'nama',
    })
    return items
  }

  return { ...crud, fetchOptions }
})
