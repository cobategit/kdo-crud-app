import { ValidationError } from './errors'

/** Rapikan teks: buang spasi di awal/akhir dan gabungkan spasi berulang. */
export function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/** Rapikan teks wajib; tolak bila kosong setelah dirapikan. */
export function requireText(value: string, field: string, label: string): string {
  const cleaned = cleanText(value)
  if (!cleaned)
    throw new ValidationError('Data tidak valid', [{ field, message: `${label} wajib diisi` }])
  return cleaned
}

/** Rapikan teks opsional; string kosong menjadi `null`. */
export function optionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
