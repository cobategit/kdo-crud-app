import { describe, expect, it } from 'bun:test'
import { mapDatabaseError } from '../src/lib/errors'
import { isValidNomorPolisi, normalizeNomorPolisi } from '../src/lib/nomor-polisi'
import { buildMeta, escapeLike, parseSort, resolvePage } from '../src/lib/pagination'

describe('normalizeNomorPolisi', () => {
  it.each([
    ['b1234abc', 'B 1234 ABC'],
    ['  d  12 x ', 'D 12 X'],
    ['AB-1-CD', 'AB 1 CD'],
    ['b 1234', 'B 1234'],
    ['B   9023   pua', 'B 9023 PUA'],
  ])('%p → %p', (input, expected) => {
    expect(normalizeNomorPolisi(input)).toBe(expected)
  })

  it('memvalidasi pola nomor polisi', () => {
    expect(isValidNomorPolisi('B 1234 ABC')).toBe(true)
    expect(isValidNomorPolisi('AB 1')).toBe(true)
    expect(isValidNomorPolisi('ABC 1234 A')).toBe(false)
    expect(isValidNomorPolisi('B 12345 A')).toBe(false)
    expect(isValidNomorPolisi('B 1234 ABCD')).toBe(false)
    expect(isValidNomorPolisi(normalizeNomorPolisi('1234 ABC'))).toBe(false)
  })
})

describe('pagination', () => {
  it('membatasi per_page maksimal 100 dan page minimal 1', () => {
    expect(resolvePage(0, 500)).toEqual({ page: 1, per_page: 100, offset: 0 })
    expect(resolvePage(3, 10)).toEqual({ page: 3, per_page: 10, offset: 20 })
    expect(resolvePage()).toEqual({ page: 1, per_page: 10, offset: 0 })
  })

  it('menghitung total_pages', () => {
    expect(buildMeta(resolvePage(1, 10), 57)).toEqual({
      page: 1,
      per_page: 10,
      total: 57,
      total_pages: 6,
    })
    expect(buildMeta(resolvePage(1, 10), 0).total_pages).toBe(1)
  })

  it('mengurai sort dan mengabaikan field yang tidak diizinkan', () => {
    const allowed = ['nama', 'tahun_produksi'] as const
    const fallback = { field: 'nama' as const, desc: false }
    expect(parseSort('-tahun_produksi', allowed, fallback)).toEqual({
      field: 'tahun_produksi',
      desc: true,
    })
    expect(parseSort('password', allowed, fallback)).toEqual(fallback)
    expect(parseSort(undefined, allowed, fallback)).toEqual(fallback)
  })

  it('meng-escape wildcard LIKE', () => {
    expect(escapeLike('50%_a\\b')).toBe('50\\%\\_a\\\\b')
  })
})

describe('mapDatabaseError', () => {
  it('memetakan unique violation 23505 ke DATA_DUPLIKAT dengan nama field', () => {
    const err = mapDatabaseError({
      message: 'Failed query',
      cause: { code: '23505', constraint_name: 'pegawai_nip_uq' },
    })
    expect(err?.status).toBe(409)
    expect(err?.code).toBe('DATA_DUPLIKAT')
    expect(err?.details?.[0]?.field).toBe('nip')
  })

  it('mengembalikan undefined untuk error yang tidak dikenal', () => {
    expect(mapDatabaseError(new Error('boom'))).toBeUndefined()
  })
})
