export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ApiSuccess<T, M = undefined> {
  success: true
  data: T
  meta?: M
}

export type ApiErrorCode =
  | 'VALIDASI_GAGAL'
  | 'TIDAK_DITEMUKAN'
  | 'DATA_DUPLIKAT'
  | 'RELASI_MASIH_DIGUNAKAN'
  | 'PENANGGUNG_JAWAB_TIDAK_VALID'
  | 'KESALAHAN_SERVER'
  | 'JARINGAN'

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  success: false
  error: { code: ApiErrorCode; message: string; details?: ApiErrorDetail[] }
}

export interface HealthStatus {
  status: 'ok'
  database: 'ok'
  latency_ms: number
  waktu: string
}
