import { describe, expect, it } from 'vitest'
import { formatAngka, formatTanggalWaktu } from './format'

describe('format', () => {
  it('memformat angka dengan pemisah ribuan Indonesia', () => {
    expect(formatAngka(1234567)).toBe('1.234.567')
  })

  it('memformat tanggal ke zona waktu Asia/Jakarta', () => {
    // 2024-01-01T00:00Z = 07:00 WIB
    expect(formatTanggalWaktu('2024-01-01T00:00:00Z')).toContain('07.00')
    expect(formatTanggalWaktu(null)).toBe('-')
  })
})
