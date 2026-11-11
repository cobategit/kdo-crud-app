import axios, { AxiosError } from 'axios'
import type { ApiErrorBody, ApiErrorCode, ApiErrorDetail } from '@/types/api'

/** Error API yang sudah dinormalisasi; komponen & store cukup menangani kelas ini. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details: ApiErrorDetail[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** Pesan error per field, siap dipasang ke `setErrors` VeeValidate. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]))
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as ApiErrorBody).success === false &&
    typeof (value as ApiErrorBody).error?.code === 'string'
  )
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof AxiosError) {
    const body = error.response?.data
    if (isApiErrorBody(body)) {
      return new ApiError(
        error.response?.status ?? 500,
        body.error.code,
        body.error.message,
        body.error.details ?? [],
      )
    }
    if (!error.response) {
      return new ApiError(0, 'JARINGAN', 'Tidak dapat terhubung ke server. Periksa koneksi Anda.')
    }
    return new ApiError(error.response.status, 'KESALAHAN_SERVER', 'Terjadi kesalahan pada server')
  }
  return new ApiError(500, 'KESALAHAN_SERVER', 'Terjadi kesalahan yang tidak terduga')
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
