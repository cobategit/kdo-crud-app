const yearFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
})

/** Tahun berjalan menurut zona waktu Asia/Jakarta. */
export function tahunBerjalan(now: Date = new Date()): number {
  return Number(yearFormatter.format(now))
}

export function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
