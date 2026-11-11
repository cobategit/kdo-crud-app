/** Pola nomor polisi setelah normalisasi, mis. `B 1234 ABC`, `AB 12`, `D 1 A`. */
export const NOMOR_POLISI_PATTERN = /^[A-Z]{1,2} \d{1,4}( [A-Z]{1,3})?$/

/**
 * Menormalisasi nomor polisi: huruf besar, buang karakter non-alfanumerik,
 * lalu pisahkan bagian huruf-angka-huruf dengan satu spasi.
 * `b1234abc` → `B 1234 ABC`, `  d  12 x ` → `D 12 X`.
 */
export function normalizeNomorPolisi(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const match = compact.match(/^([A-Z]+)(\d+)([A-Z]*)$/)
  if (!match) return raw.toUpperCase().trim().replace(/\s+/g, ' ')
  const [, wilayah, nomor, seri] = match
  return [wilayah, nomor, seri].filter(Boolean).join(' ')
}

export function isValidNomorPolisi(value: string): boolean {
  return NOMOR_POLISI_PATTERN.test(value)
}
