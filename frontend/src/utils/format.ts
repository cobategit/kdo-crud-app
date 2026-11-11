const TZ = 'Asia/Jakarta'

export function formatTanggalWaktu(value: string | Date | null | undefined): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TZ,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatAngka(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}
