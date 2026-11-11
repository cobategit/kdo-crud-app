import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { type ApiError, toApiError } from '@/api/http'
import type { DashboardRingkasan } from '@/types/models'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = shallowRef<DashboardRingkasan | null>(null)
  const loading = ref(false)
  const error = shallowRef<ApiError | null>(null)
  /** true bila data sudah pernah dimuat namun ada perubahan data sesudahnya. */
  const stale = ref(false)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      data.value = await dashboardApi.ringkasan()
      stale.value = false
    } catch (e) {
      error.value = toApiError(e)
    } finally {
      loading.value = false
    }
  }

  /** Dipanggil store lain setelah ada perubahan data: muat ulang bila ringkasan sudah pernah dimuat. */
  function invalidate() {
    if (!data.value) return
    stale.value = true
    void fetch()
  }

  return { data, loading, error, stale, fetch, invalidate }
})
