import type { PaginationMeta } from './response'

export const DEFAULT_PER_PAGE = 10
export const MAX_PER_PAGE = 100

export interface PageParams {
  page: number
  per_page: number
  offset: number
}

export function resolvePage(page?: number, perPage?: number): PageParams {
  const p = Math.max(1, Math.trunc(page ?? 1))
  const pp = Math.min(MAX_PER_PAGE, Math.max(1, Math.trunc(perPage ?? DEFAULT_PER_PAGE)))
  return { page: p, per_page: pp, offset: (p - 1) * pp }
}

export function buildMeta(params: PageParams, total: number): PaginationMeta {
  return {
    page: params.page,
    per_page: params.per_page,
    total,
    total_pages: Math.max(1, Math.ceil(total / params.per_page)),
  }
}

/**
 * Mengurai parameter `sort` seperti `nama` atau `-tahun_produksi`.
 * Field di luar daftar yang diizinkan diabaikan (kembali ke default).
 */
export function parseSort<F extends string>(
  sort: string | undefined,
  allowed: readonly F[],
  fallback: { field: F; desc: boolean },
): { field: F; desc: boolean } {
  if (!sort) return fallback
  const desc = sort.startsWith('-')
  const field = (desc ? sort.slice(1) : sort) as F
  return allowed.includes(field) ? { field, desc } : fallback
}

/** Escape karakter wildcard LIKE agar input pencarian diperlakukan literal. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}
