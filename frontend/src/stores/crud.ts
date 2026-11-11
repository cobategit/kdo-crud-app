import { ref, shallowRef } from 'vue'
import type { Paginated } from '@/api/crud'
import { type ApiError, toApiError } from '@/api/http'
import type { PaginationMeta } from '@/types/api'

export interface CrudApi<TItem, TDetail, TPayload, TParams> {
  list(params: TParams): Promise<Paginated<TItem>>
  get(id: string): Promise<TDetail>
  create(payload: TPayload): Promise<TDetail>
  update(id: string, payload: TPayload): Promise<TDetail>
  remove(id: string): Promise<void>
}

/**
 * State & aksi CRUD standar yang dipakai setiap setup store entitas:
 * state `items`, `meta`, `filters`, `current`, `loading`, `error`
 * dan aksi `fetchList`, `fetchById`, `create`, `update`, `remove`.
 * Store hanya memanggil modul `api/`; komponen tidak memanggil axios langsung.
 */
export function useCrudState<
  TItem extends { id: string },
  TDetail,
  TPayload,
  TParams extends object,
>(
  api: CrudApi<TItem, TDetail, TPayload, TParams>,
  options: { defaultFilters: TParams; onMutated?: () => void },
) {
  const items = shallowRef<TItem[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const filters = ref<TParams>({ ...options.defaultFilters })
  const current = shallowRef<TDetail | null>(null)
  const loading = ref(false)
  const loadingCurrent = ref(false)
  const saving = ref(false)
  const error = shallowRef<ApiError | null>(null)

  let listRequest = 0

  async function fetchList(params?: TParams) {
    if (params) filters.value = { ...params }
    const requestId = ++listRequest
    loading.value = true
    error.value = null
    try {
      const result = await api.list(filters.value)
      if (requestId !== listRequest) return // respons usang (filter sudah berubah)
      items.value = result.items
      meta.value = result.meta
    } catch (e) {
      if (requestId !== listRequest) return
      error.value = toApiError(e)
    } finally {
      if (requestId === listRequest) loading.value = false
    }
  }

  async function fetchById(id: string) {
    loadingCurrent.value = true
    error.value = null
    try {
      current.value = await api.get(id)
      return current.value
    } catch (e) {
      current.value = null
      error.value = toApiError(e)
      throw error.value
    } finally {
      loadingCurrent.value = false
    }
  }

  async function mutate<R>(fn: () => Promise<R>): Promise<R> {
    saving.value = true
    try {
      const result = await fn()
      options.onMutated?.()
      return result
    } catch (e) {
      throw toApiError(e)
    } finally {
      saving.value = false
    }
  }

  async function create(payload: TPayload) {
    const created = await mutate(() => api.create(payload))
    current.value = created
    return created
  }

  async function update(id: string, payload: TPayload) {
    const updated = await mutate(() => api.update(id, payload))
    current.value = updated
    return updated
  }

  /** Hapus lalu muat ulang list dengan filter yang sama (bila list pernah dimuat). */
  async function remove(id: string) {
    await mutate(() => api.remove(id))
    if ((current.value as { id?: string } | null)?.id === id) current.value = null
    items.value = items.value.filter((i) => i.id !== id)
    if (meta.value) await fetchList()
  }

  /** Ambil subset data tanpa mengubah state list (untuk dropdown & halaman detail). */
  async function query(params: TParams) {
    return api.list(params)
  }

  return {
    items,
    meta,
    filters,
    current,
    loading,
    loadingCurrent,
    saving,
    error,
    fetchList,
    fetchById,
    create,
    update,
    remove,
    query,
  }
}
