import { beforeEach, describe, expect, it } from 'bun:test'
import { buatKendaraan, buatPegawai, buatPerangkatDaerah, request, resetDb } from './helpers'

describe('GET /api/v1/dashboard/ringkasan', () => {
  beforeEach(resetDb)

  it('mengembalikan angka nol saat data kosong', async () => {
    const res = await request('GET', '/api/v1/dashboard/ringkasan')
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({
      kendaraan: { total: 0, baik: 0, rusak_ringan: 0, rusak_berat: 0, tanpa_penanggung_jawab: 0 },
      total_pegawai: 0,
      total_perangkat_daerah: 0,
      per_perangkat_daerah: [],
    })
  })

  it('mengagregasi kondisi kendaraan total dan per perangkat daerah', async () => {
    const a = await buatPerangkatDaerah('A Dinas')
    const b = await buatPerangkatDaerah('B Dinas')
    const c = await buatPerangkatDaerah('C Dinas')
    const pj = await buatPegawai(a.id)
    await buatPegawai(b.id)
    await buatKendaraan(a.id, { kondisi: 'baik', pegawai_id: pj.id })
    await buatKendaraan(a.id, { kondisi: 'rusak_ringan' })
    await buatKendaraan(b.id, { kondisi: 'rusak_berat' })
    await buatKendaraan(b.id, { kondisi: 'baik' })

    const { body } = await request('GET', '/api/v1/dashboard/ringkasan')
    expect(body.data.kendaraan).toEqual({
      total: 4,
      baik: 2,
      rusak_ringan: 1,
      rusak_berat: 1,
      tanpa_penanggung_jawab: 3,
    })
    expect(body.data.total_pegawai).toBe(2)
    expect(body.data.total_perangkat_daerah).toBe(3)
    expect(body.data.per_perangkat_daerah).toEqual([
      {
        perangkat_daerah: { id: a.id, nama: 'A Dinas' },
        total: 2,
        baik: 1,
        rusak_ringan: 1,
        rusak_berat: 0,
        tanpa_penanggung_jawab: 1,
      },
      {
        perangkat_daerah: { id: b.id, nama: 'B Dinas' },
        total: 2,
        baik: 1,
        rusak_ringan: 0,
        rusak_berat: 1,
        tanpa_penanggung_jawab: 2,
      },
      {
        perangkat_daerah: { id: c.id, nama: 'C Dinas' },
        total: 0,
        baik: 0,
        rusak_ringan: 0,
        rusak_berat: 0,
        tanpa_penanggung_jawab: 0,
      },
    ])
  })
})
