import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { perangkatDaerahApi } from '@/api/perangkatDaerah'
import type { ListParams, RefPerangkatDaerah } from '@/types/models'
import { useCrudState } from './crud'
import { useDashboardStore } from './dashboard'

export const usePerangkatDaerahStore = defineStore('perangkatDaerah', () => {
  /** Opsi dropdown (semua perangkat daerah, maks 100), di-cache dan disegarkan setelah perubahan. */
  const options = shallowRef<RefPerangkatDaerah[]>([])
  let optionsLoaded = false

  const crud = useCrudState(perangkatDaerahApi, {
    defaultFilters: { page: 1, per_page: 10, sort: 'nama' } as ListParams,
    onMutated: () => {
      optionsLoaded = false
      useDashboardStore().invalidate()
    },
  })

  async function fetchOptions(force = false) {
    if (optionsLoaded && !force) return options.value
    const { items } = await perangkatDaerahApi.list({ per_page: 100, sort: 'nama' })
    options.value = items.map(({ id, nama }) => ({ id, nama }))
    optionsLoaded = true
    return options.value
  }

  return { ...crud, options, fetchOptions }
})
