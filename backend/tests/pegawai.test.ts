import { beforeEach, describe, expect, it } from 'bun:test'
import {
  buatKendaraan,
  buatPegawai,
  buatPerangkatDaerah,
  nipUnik,
  request,
  resetDb,
} from './helpers'

const URL = '/api/v1/pegawai'

describe('Pegawai API', () => {
  beforeEach(resetDb)

  it('membuat pegawai dan mengembalikan relasi perangkat daerah', async () => {
    const pd = await buatPerangkatDaerah('Dinas Kesehatan')
    const res = await request('POST', URL, {
      nama: 'Siti Aminah',
      nip: '199001012015032001',
      jabatan: 'Analis Kesehatan',
      golongan: 'III/b',
      perangkat_daerah_id: pd.id,
    })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      nama: 'Siti Aminah',
      nip: '199001012015032001',
      golongan: 'III/b',
      perangkat_daerah: { id: pd.id, nama: 'Dinas Kesehatan' },
      jumlah_kendaraan: 0,
      kendaraan: [],
    })
  })

  it.each([
    ['12345', 'NIP harus 18 digit angka'],
    ['19900101201503200A', 'NIP harus 18 digit angka'],
    ['1990010120150320011', 'NIP harus 18 digit angka'],
  ])('menolak NIP tidak valid %p', async (nip, message) => {
    const pd = await buatPerangkatDaerah()
    const res = await request('POST', URL, {
      nama: 'A',
      nip,
      jabatan: 'Staf',
      golongan: 'II/a',
      perangkat_daerah_id: pd.id,
    })
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('VALIDASI_GAGAL')
    expect(res.body.error.details).toContainEqual({ field: 'nip', message })
  })

  it.each(['V/a', 'III/e', 'iii/a', ''])('menolak golongan tidak valid %p', async (golongan) => {
    const pd = await buatPerangkatDaerah()
    const res = await request('POST', URL, {
      nama: 'A',
      nip: nipUnik(),
      jabatan: 'Staf',
      golongan,
      perangkat_daerah_id: pd.id,
    })
    expect(res.status).toBe(422)
    expect(res.body.error.details[0].field).toBe('golongan')
  })

  it('menerima seluruh golongan I/a s.d. IV/e', async () => {
    const pd = await buatPerangkatDaerah()
    for (const golongan of ['I/a', 'II/d', 'III/c', 'IV/e']) {
      const p = await buatPegawai(pd.id, { golongan })
      expect(p.id).toBeString()
    }
  })

  it('menolak NIP duplikat (409 DATA_DUPLIKAT)', async () => {
    const pd = await buatPerangkatDaerah()
    const p = await buatPegawai(pd.id)
    const res = await request('POST', URL, {
      nama: 'Lain',
      nip: p.nip,
      jabatan: 'Staf',
      golongan: 'II/a',
      perangkat_daerah_id: pd.id,
    })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DATA_DUPLIKAT')
    expect(res.body.error.details[0].field).toBe('nip')
  })

  it('menolak perangkat daerah yang tidak ada (422)', async () => {
    const res = await request('POST', URL, {
      nama: 'A',
      nip: nipUnik(),
      jabatan: 'Staf',
      golongan: 'II/a',
      perangkat_daerah_id: '00000000-0000-4000-8000-000000000000',
    })
    expect(res.status).toBe(422)
    expect(res.body.error.details[0].field).toBe('perangkat_daerah_id')
  })

  it('menolak hapus pegawai yang masih menjadi penanggung jawab dan menyebut nomor polisi', async () => {
    const pd = await buatPerangkatDaerah()
    const p = await buatPegawai(pd.id)
    await buatKendaraan(pd.id, { nomor_polisi: 'B 777 XYZ', pegawai_id: p.id })

    const res = await request('DELETE', `${URL}/${p.id}`)
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('RELASI_MASIH_DIGUNAKAN')
    expect(res.body.error.message).toContain('B 777 XYZ')
  })

  it('menghapus pegawai yang tidak menjadi penanggung jawab', async () => {
    const pd = await buatPerangkatDaerah()
    const p = await buatPegawai(pd.id)
    expect((await request('DELETE', `${URL}/${p.id}`)).status).toBe(200)
    expect((await request('GET', `${URL}/${p.id}`)).status).toBe(404)
  })

  it('menolak pindah perangkat daerah bila masih penanggung jawab kendaraan di PD lama', async () => {
    const lama = await buatPerangkatDaerah('Dinas Lama')
    const baru = await buatPerangkatDaerah('Dinas Baru')
    const p = await buatPegawai(lama.id)
    await buatKendaraan(lama.id, { nomor_polisi: 'D 1 AB', pegawai_id: p.id })

    const body = { nama: p.nama, nip: p.nip, jabatan: 'Staf', golongan: 'III/a' }
    const res = await request('PUT', `${URL}/${p.id}`, { ...body, perangkat_daerah_id: baru.id })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('RELASI_MASIH_DIGUNAKAN')
    expect(res.body.error.message).toContain('D 1 AB')

    // Mengubah data lain tanpa pindah PD tetap boleh
    const ok = await request('PUT', `${URL}/${p.id}`, {
      ...body,
      jabatan: 'Kepala Seksi',
      perangkat_daerah_id: lama.id,
    })
    expect(ok.status).toBe(200)
    expect(ok.body.data.jabatan).toBe('Kepala Seksi')
    expect(ok.body.data.kendaraan).toHaveLength(1)
  })

  it('mengizinkan pindah perangkat daerah bila bukan penanggung jawab', async () => {
    const lama = await buatPerangkatDaerah()
    const baru = await buatPerangkatDaerah()
    const p = await buatPegawai(lama.id)
    const res = await request('PUT', `${URL}/${p.id}`, {
      nama: p.nama,
      nip: p.nip,
      jabatan: 'Staf',
      golongan: 'III/a',
      perangkat_daerah_id: baru.id,
    })
    expect(res.status).toBe(200)
    expect(res.body.data.perangkat_daerah.id).toBe(baru.id)
  })

  it('mendaftar dengan pencarian nama/NIP, filter, sort golongan, dan pagination', async () => {
    const a = await buatPerangkatDaerah()
    const b = await buatPerangkatDaerah()
    await buatPegawai(a.id, { nama: 'Budi', golongan: 'IV/a' })
    await buatPegawai(a.id, { nama: 'Ani', golongan: 'II/b' })
    await buatPegawai(b.id, { nama: 'Citra', golongan: 'III/c', nip: '197001011990031999' })

    const byPd = await request('GET', `${URL}?perangkat_daerah_id=${a.id}`)
    expect(byPd.body.meta.total).toBe(2)
    expect(byPd.body.data.map((p: { nama: string }) => p.nama)).toEqual(['Ani', 'Budi'])

    const byGol = await request('GET', `${URL}?golongan=${encodeURIComponent('III/c')}`)
    expect(byGol.body.data.map((p: { nama: string }) => p.nama)).toEqual(['Citra'])

    const byNip = await request('GET', `${URL}?search=1990031999`)
    expect(byNip.body.data[0].nama).toBe('Citra')

    const sorted = await request('GET', `${URL}?sort=-golongan`)
    expect(sorted.body.data.map((p: { golongan: string }) => p.golongan)).toEqual([
      'IV/a',
      'III/c',
      'II/b',
    ])

    const paged = await request('GET', `${URL}?per_page=1&page=3`)
    expect(paged.body.meta).toEqual({ page: 3, per_page: 1, total: 3, total_pages: 3 })

    const invalid = await request('GET', `${URL}?golongan=X`)
    expect(invalid.status).toBe(422)
  })
})
