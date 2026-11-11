import type { ApiSuccess, PaginationMeta } from '@/types/api'
import { http } from './http'

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

/** Buang parameter kosong agar URL request tetap bersih. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>
}

/** Modul API CRUD standar untuk satu resource REST. */
export function createCrudApi<TItem, TDetail, TPayload, TParams extends object>(resource: string) {
  return {
    async list(params: TParams): Promise<Paginated<TItem>> {
      const { data } = await http.get<{ success: true; data: TItem[]; meta: PaginationMeta }>(
        resource,
        {
          params: cleanParams(params),
        },
      )
      return { items: data.data, meta: data.meta }
    },
    async get(id: string): Promise<TDetail> {
      const { data } = await http.get<ApiSuccess<TDetail>>(`${resource}/${id}`)
      return data.data
    },
    async create(payload: TPayload): Promise<TDetail> {
      const { data } = await http.post<ApiSuccess<TDetail>>(resource, payload)
      return data.data
    },
    async update(id: string, payload: TPayload): Promise<TDetail> {
      const { data } = await http.put<ApiSuccess<TDetail>>(`${resource}/${id}`, payload)
      return data.data
    },
    async remove(id: string): Promise<void> {
      await http.delete(`${resource}/${id}`)
    },
  }
}
