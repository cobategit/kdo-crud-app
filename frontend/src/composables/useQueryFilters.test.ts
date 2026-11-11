import { describe, expect, it } from 'vitest'
import { parseQuery, serializeQuery } from './useQueryFilters'

const defaults = { search: '', kondisi: '', page: 1, tanpa_penanggung_jawab: false }

describe('useQueryFilters helpers', () => {
  it('mengurai query string menjadi filter bertipe dengan default', () => {
    expect(
      parseQuery({ search: 'toyota', page: '3', tanpa_penanggung_jawab: 'true' }, defaults),
    ).toEqual({
      search: 'toyota',
      kondisi: '',
      page: 3,
      tanpa_penanggung_jawab: true,
    })
    expect(parseQuery({ page: 'abc' }, defaults).page).toBe(1)
  })

  it('hanya menulis nilai yang berbeda dari default ke URL', () => {
    expect(
      serializeQuery(
        { search: '', kondisi: 'baik', page: 1, tanpa_penanggung_jawab: true },
        defaults,
      ),
    ).toEqual({ kondisi: 'baik', tanpa_penanggung_jawab: 'true' })
  })
})
