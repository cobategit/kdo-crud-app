import type { ErrorCode, ErrorDetail } from './errors'

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface SuccessResponse<T, M = undefined> {
  success: true
  data: T
  meta?: M
}

export interface ErrorResponse {
  success: false
  error: { code: ErrorCode; message: string; details?: ErrorDetail[] }
}

export function ok<T>(data: T): SuccessResponse<T> {
  return { success: true, data }
}

export function paginated<T>(
  data: T[],
  meta: PaginationMeta,
): SuccessResponse<T[], PaginationMeta> {
  return { success: true, data, meta }
}

export function fail(code: ErrorCode, message: string, details?: ErrorDetail[]): ErrorResponse {
  return details?.length
    ? { success: false, error: { code, message, details } }
    : { success: false, error: { code, message } }
}
