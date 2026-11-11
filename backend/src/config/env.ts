/**
 * Membaca & memvalidasi environment variable sekali saat startup.
 * Aplikasi berhenti dengan pesan jelas bila ada variabel wajib yang hilang/tidak valid.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable ${name} wajib diisi`)
  }
  return value
}

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') return fallback
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT tidak valid: ${raw}`)
  }
  return port
}

// Seluruh tanggal diproses dalam zona waktu Asia/Jakarta.
process.env.TZ ??= 'Asia/Jakarta'

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: required('DATABASE_URL'),
  PORT: parsePort(process.env.PORT, 3000),
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  TZ: process.env.TZ,
} as const

export type Env = typeof env
