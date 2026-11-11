import { beforeEach, describe, expect, it } from 'bun:test'
import { buatKendaraan, buatPegawai, buatPerangkatDaerah, request, resetDb } from './helpers'

const URL = '/api/v1/perangkat-daerah'

describe('Perangkat Daerah API', () => {
  beforeEach(resetDb)

  it('membuat, membaca, mengubah, dan menghapus perangkat daerah', async () => {
    const created = await request('POST', URL, { nama: '  Dinas   Perhubungan ' })
    expect(created.status).toBe(201)
    expect(created.body.data.nama).toBe('Dinas Perhubungan')
    const id = created.body.data.id

    const detail = await request('GET', `${URL}/${id}`)
    expect(detail.status).toBe(200)
    expect(detail.body.data).toMatchObject({
      nama: 'Dinas Perhubungan',
      jumlah_pegawai: 0,
      jumlah_kendaraan: 0,
      rekap_kondisi: { baik: 0, rusak_ringan: 0, rusak_berat: 0, tanpa_penanggung_jawab: 0 },
    })

    const updated = await request('PUT', `${URL}/${id}`, { nama: 'Dinas Perhubungan Daerah' })
    expect(updated.status).toBe(200)
    expect(updated.body.data.nama).toBe('Dinas Perhubungan Daerah')

    const deleted = await request('DELETE', `${URL}/${id}`)
    expect(deleted.status).toBe(200)
    expect((await request('GET', `${URL}/${id}`)).status).toBe(404)
  })

  it('menolak nama duplikat secara case-insensitive (409 DATA_DUPLIKAT)', async () => {
    await buatPerangkatDaerah('Dinas Kesehatan')
    const res = await request('POST', URL, { nama: 'dinas KESEHATAN' })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DATA_DUPLIKAT')
    expect(res.body.error.details[0].field).toBe('nama')
  })

  it('menolak nama kosong (422)', async () => {
    const res = await request('POST', URL, { nama: '   ' })
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('VALIDASI_GAGAL')
    expect(res.body.error.details[0].field).toBe('nama')
  })

  it('mengembalikan 422 untuk ID berformat salah dan 404 untuk ID yang tidak ada', async () => {
    const bad = await request('GET', `${URL}/bukan-uuid`)
    expect(bad.status).toBe(422)
    expect(bad.body.error.details[0]).toEqual({ field: 'id', message: 'ID harus berformat UUID' })

    const missing = await request('GET', `${URL}/00000000-0000-4000-8000-000000000000`)
    expect(missing.status).toBe(404)
    expect(missing.body.error.code).toBe('TIDAK_DITEMUKAN')
  })

  it('menolak hapus bila masih memiliki pegawai/kendaraan dan menyebutkan jumlahnya', async () => {
    const pd = await buatPerangkatDaerah('Dinas Pendidikan')
    await buatPegawai(pd.id)
    await buatPegawai(pd.id)
    await buatKendaraan(pd.id)

    const res = await request('DELETE', `${URL}/${pd.id}`)
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('RELASI_MASIH_DIGUNAKAN')
    expect(res.body.error.message).toContain('2 pegawai')
    expect(res.body.error.message).toContain('1 kendaraan')
  })

  it('mendaftar dengan pencarian, pagination, sort, dan jumlah relasi', async () => {
    const a = await buatPerangkatDaerah('Dinas Pendidikan')
    await buatPerangkatDaerah('Dinas Kesehatan')
    await buatPerangkatDaerah('Badan Keuangan')
    await buatPegawai(a.id)
    await buatKendaraan(a.id)
    await buatKendaraan(a.id)

    const all = await request('GET', `${URL}?per_page=2&page=2`)
    expect(all.body.meta).toEqual({ page: 2, per_page: 2, total: 3, total_pages: 2 })
    expect(all.body.data).toHaveLength(1)

    const search = await request('GET', `${URL}?search=dinas`)
    expect(search.body.meta.total).toBe(2)

    const sorted = await request('GET', `${URL}?sort=-jumlah_kendaraan`)
    expect(sorted.body.data[0]).toMatchObject({
      nama: 'Dinas Pendidikan',
      jumlah_pegawai: 1,
      jumlah_kendaraan: 2,
    })

    const like = await request('GET', `${URL}?search=${encodeURIComponent('%')}`)
    expect(like.body.meta.total).toBe(0)
  })

  it('membatasi per_page maksimal 100', async () => {
    const res = await request('GET', `${URL}?per_page=500`)
    expect(res.status).toBe(200)
    expect(res.body.meta.per_page).toBe(100)
  })
})
