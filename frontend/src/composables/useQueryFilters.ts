import { computed } from 'vue'
import { type LocationQuery, useRoute, useRouter } from 'vue-router'

type FilterValue = string | number | boolean
export type FilterDefaults = Record<string, FilterValue>

/** Lebarkan tipe literal (mis. `false`) menjadi tipe dasarnya (`boolean`). */
export type Widen<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends number
      ? number
      : T[K] extends boolean
        ? boolean
        : T[K]
}

function first(value: LocationQuery[string] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return v ?? undefined
}

export function parseQuery<T extends FilterDefaults>(query: LocationQuery, defaults: T): T {
  const result = { ...defaults }
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const raw = first(query[key])
    if (raw === undefined || raw === '') continue
    const def = defaults[key]
    if (typeof def === 'number') {
      const n = Number(raw)
      if (Number.isFinite(n)) result[key] = n as T[typeof key]
    } else if (typeof def === 'boolean') {
      result[key] = (raw === 'true') as T[typeof key]
    } else {
      result[key] = raw as T[typeof key]
    }
  }
  return result
}

export function serializeQuery<T extends FilterDefaults>(
  values: T,
  defaults: T,
): Record<string, string> {
  const query: Record<string, string> = {}
  for (const key of Object.keys(defaults)) {
    const v = values[key]
    if (v === undefined || v === '' || v === defaults[key]) continue
    query[key] = String(v)
  }
  return query
}

/**
 * Filter, pencarian, sort, dan halaman disimpan di query string URL
 * sehingga dapat di-refresh dan dibagikan. URL adalah sumber kebenaran.
 */
export function useQueryFilters<D extends FilterDefaults>(initial: D) {
  type T = Widen<D> & FilterDefaults
  const defaults = initial as unknown as T
  const route = useRoute()
  const router = useRouter()

  const filters = computed<T>(() => parseQuery(route.query, defaults))

  /** Perbarui sebagian filter. Halaman kembali ke 1 kecuali `page` ikut diubah. */
  function update(patch: Partial<T>) {
    const next = { ...filters.value, ...patch }
    if ('page' in defaults && !('page' in patch)) (next as FilterDefaults).page = 1
    return router.replace({ query: serializeQuery(next, defaults) })
  }

  function reset() {
    return router.replace({ query: {} })
  }

  const isFiltered = computed(() =>
    Object.keys(defaults).some(
      (k) => k !== 'page' && k !== 'sort' && filters.value[k] !== defaults[k],
    ),
  )

  return { filters, update, reset, isFiltered }
}
