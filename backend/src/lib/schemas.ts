import { type TSchema, t } from 'elysia'
import { MAX_PER_PAGE } from './pagination'

/** Skema TypeBox bersama untuk validasi request & dokumentasi OpenAPI. */

export const Uuid = (label = 'ID') =>
  t.String({
    format: 'uuid',
    error: `${label} harus berformat UUID`,
    examples: ['0b6c6f7e-2f1a-4d5e-9a63-6c1f1f2b9e11'],
  })

export const IdParams = t.Object({ id: Uuid() })

/** `page` & `per_page` di-clamp di service (page ≥ 1, 1 ≤ per_page ≤ 100). */
export const PageQuery = {
  page: t.Optional(t.Numeric({ error: 'page harus berupa angka' })),
  per_page: t.Optional(
    t.Numeric({ error: 'per_page harus berupa angka', description: `Maksimal ${MAX_PER_PAGE}` }),
  ),
  search: t.Optional(t.String({ maxLength: 100, error: 'search maksimal 100 karakter' })),
}

export const Timestamps = {
  created_at: t.String({ format: 'date-time' }),
  updated_at: t.String({ format: 'date-time' }),
}

export const PaginationMetaSchema = t.Object({
  page: t.Number(),
  per_page: t.Number(),
  total: t.Number(),
  total_pages: t.Number(),
})

export const RefPerangkatDaerah = t.Object({ id: t.String(), nama: t.String() })

export const RefPenanggungJawab = t.Object({
  id: t.String(),
  nama: t.String(),
  nip: t.String(),
  jabatan: t.String(),
})

export const success = <T extends TSchema>(data: T) => t.Object({ success: t.Literal(true), data })

export const paginatedSuccess = <T extends TSchema>(item: T) =>
  t.Object({ success: t.Literal(true), data: t.Array(item), meta: PaginationMetaSchema })

export const ErrorSchema = t.Object({
  success: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    details: t.Optional(t.Array(t.Object({ field: t.String(), message: t.String() }))),
  }),
})

/** Respons error umum untuk dokumentasi OpenAPI. */
export const errorResponses = {
  404: ErrorSchema,
  409: ErrorSchema,
  422: ErrorSchema,
  500: ErrorSchema,
}
