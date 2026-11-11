/** Sama dengan normalisasi di backend: `b1234abc` → `B 1234 ABC`. */
export function normalizeNomorPolisi(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const match = compact.match(/^([A-Z]+)(\d+)([A-Z]*)$/)
  if (!match) return raw.toUpperCase().trim().replace(/\s+/g, ' ')
  const [, wilayah, nomor, seri] = match
  return [wilayah, nomor, seri].filter(Boolean).join(' ')
}

export const NOMOR_POLISI_PATTERN = /^[A-Z]{1,2} \d{1,4}( [A-Z]{1,3})?$/

export function tahunBerjalan(): number {
  return Number(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric' }).format(
      new Date(),
    ),
  )
}
