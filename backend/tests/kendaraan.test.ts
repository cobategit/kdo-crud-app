import { beforeEach, describe, expect, it } from 'bun:test'
import { tahunBerjalan } from '../src/lib/time'
import {
  buatKendaraan,
  buatPegawai,
  buatPerangkatDaerah,
  kendaraanPayload,
  request,
  resetDb,
} from './helpers'

const URL = '/api/v1/kendaraan'

describe('Kendaraan API', () => {
  beforeEach(resetDb)

  it('membuat kendaraan, menormalisasi nomor polisi, dan menyertakan relasi', async () => {
    const pd = await buatPerangkatDaerah('Dinas PUPR')
    const pj = await buatPegawai(pd.id, { nama: 'Hendra', jabatan: 'Kabid' })
    const res = await request(
      'POST',
      URL,
      kendaraanPayload(pd.id, { nomor_polisi: ' b1234abc ', pegawai_id: pj.id, keterangan: '  ' }),
    )
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      nomor_polisi: 'B 1234 ABC',
      kondisi: 'baik',
      keterangan: null,
      perangkat_daerah: { id: pd.id, nama: 'Dinas PUPR' },
      penanggung_jawab: { id: pj.id, nama: 'Hendra', nip: pj.nip, jabatan: 'Kabid' },
    })

    const detail = await request('GET', `${URL}/${res.body.data.id}`)
    expect(detail.status).toBe(200)
    expect(detail.body.data.penanggung_jawab.id).toBe(pj.id)
  })

  it.each(['ABC 1234 A', 'B 12345 A', 'B 1234 ABCD', '1234 AB', 'B'])(
    'menolak nomor polisi tidak valid %p',
    async (nomor_polisi) => {
      const pd = await buatPerangkatDaerah()
      const res = await request('POST', URL, kendaraanPayload(pd.id, { nomor_polisi }))
      expect(res.status).toBe(422)
      expect(res.body.error.details[0].field).toBe('nomor_polisi')
    },
  )

  it('memvalidasi tahun produksi antara 1980 dan tahun berjalan', async () => {
    const pd = await buatPerangkatDaerah()
    const lama = await request('POST', URL, kendaraanPayload(pd.id, { tahun_produksi: 1979 }))
    expect(lama.status).toBe(422)
    expect(lama.body.error.details[0].field).toBe('tahun_produksi')

    const depan = await request(
      'POST',
      URL,
      kendaraanPayload(pd.id, { tahun_produksi: tahunBerjalan() + 1 }),
    )
    expect(depan.status).toBe(422)
    expect(depan.body.error.details[0].field).toBe('tahun_produksi')

    const ok = await request(
      'POST',
      URL,
      kendaraanPayload(pd.id, { tahun_produksi: tahunBerjalan() }),
    )
    expect(ok.status).toBe(201)
  })

  it('menolak kondisi di luar enum', async () => {
    const pd = await buatPerangkatDaerah()
    const res = await request('POST', URL, kendaraanPayload(pd.id, { kondisi: 'hilang' }))
    expect(res.status).toBe(422)
    expect(res.body.error.details[0].field).toBe('kondisi')
  })

  it('menolak nomor polisi duplikat (termasuk beda format penulisan)', async () => {
    const pd = await buatPerangkatDaerah()
    await buatKendaraan(pd.id, { nomor_polisi: 'B 1234 ABC' })
    const res = await request('POST', URL, kendaraanPayload(pd.id, { nomor_polisi: 'b-1234-abc' }))
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DATA_DUPLIKAT')
    expect(res.body.error.details[0].field).toBe('nomor_polisi')
  })

  it('menolak penanggung jawab dari perangkat daerah berbeda', async () => {
    const pdA = await buatPerangkatDaerah()
    const pdB = await buatPerangkatDaerah()
    const pegawaiB = await buatPegawai(pdB.id)
    const res = await request('POST', URL, kendaraanPayload(pdA.id, { pegawai_id: pegawaiB.id }))
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('PENANGGUNG_JAWAB_TIDAK_VALID')
    expect(res.body.error.details[0].field).toBe('pegawai_id')
  })

  it('menolak ganti perangkat daerah bila penanggung jawab tidak ikut disesuaikan', async () => {
    const pdA = await buatPerangkatDaerah()
    const pdB = await buatPerangkatDaerah()
    const pjA = await buatPegawai(pdA.id)
    const pjB = await buatPegawai(pdB.id)
    const k = await buatKendaraan(pdA.id, { pegawai_id: pjA.id })
    const base = kendaraanPayload(pdA.id, { nomor_polisi: k.nomor_polisi })

    const inconsistent = await request('PUT', `${URL}/${k.id}`, {
      ...base,
      perangkat_daerah_id: pdB.id,
      pegawai_id: pjA.id,
    })
    expect(inconsistent.status).toBe(422)
    expect(inconsistent.body.error.code).toBe('PENANGGUNG_JAWAB_TIDAK_VALID')

    const cleared = await request('PUT', `${URL}/${k.id}`, {
      ...base,
      perangkat_daerah_id: pdB.id,
      pegawai_id: null,
    })
    expect(cleared.status).toBe(200)
    expect(cleared.body.data.penanggung_jawab).toBeNull()

    const replaced = await request('PUT', `${URL}/${k.id}`, {
      ...base,
      perangkat_daerah_id: pdB.id,
      pegawai_id: pjB.id,
    })
    expect(replaced.status).toBe(200)
    expect(replaced.body.data.penanggung_jawab.id).toBe(pjB.id)
  })

  it('mengubah kondisi lewat PATCH dan memperbarui updated_at', async () => {
    const pd = await buatPerangkatDaerah()
    const k = await buatKendaraan(pd.id)
    const before = (await request('GET', `${URL}/${k.id}`)).body.data
    await Bun.sleep(5)
    const res = await request('PATCH', `${URL}/${k.id}/kondisi`, { kondisi: 'rusak_berat' })
    expect(res.status).toBe(200)
    expect(res.body.data.kondisi).toBe('rusak_berat')
    expect(new Date(res.body.data.updated_at).getTime()).toBeGreaterThan(
      new Date(before.updated_at).getTime(),
    )

    const invalid = await request('PATCH', `${URL}/${k.id}/kondisi`, { kondisi: 'rusak' })
    expect(invalid.status).toBe(422)
  })

  it('menghapus kendaraan dan mengembalikan 404 setelahnya', async () => {
    const pd = await buatPerangkatDaerah()
    const k = await buatKendaraan(pd.id)
    expect((await request('DELETE', `${URL}/${k.id}`)).status).toBe(200)
    expect((await request('DELETE', `${URL}/${k.id}`)).status).toBe(404)
  })

  it('mendaftar dengan filter kondisi, perangkat daerah, tahun, tanpa penanggung jawab, dan pencarian', async () => {
    const pdA = await buatPerangkatDaerah()
    const pdB = await buatPerangkatDaerah()
    const pj = await buatPegawai(pdA.id)
    await buatKendaraan(pdA.id, {
      nomor_polisi: 'B 1 AAA',
      merek: 'Honda',
      kondisi: 'baik',
      tahun_produksi: 2019,
      pegawai_id: pj.id,
    })
    await buatKendaraan(pdA.id, {
      nomor_polisi: 'B 2 AAA',
      merek: 'Toyota',
      kondisi: 'rusak_ringan',
      tahun_produksi: 2020,
    })
    await buatKendaraan(pdB.id, {
      nomor_polisi: 'D 3 BBB',
      merek: 'Isuzu',
      kondisi: 'rusak_berat',
      tahun_produksi: 2020,
    })

    const total = (q: string) => request('GET', `${URL}?${q}`).then((r) => r.body.meta.total)
    expect(await total('')).toBe(3)
    expect(await total('kondisi=rusak_berat')).toBe(1)
    expect(await total(`perangkat_daerah_id=${pdA.id}`)).toBe(2)
    expect(await total('tahun_produksi=2020')).toBe(2)
    expect(await total('tanpa_penanggung_jawab=true')).toBe(2)
    expect(await total(`pegawai_id=${pj.id}`)).toBe(1)
    expect(await total('search=honda')).toBe(1)
    expect(await total('search=D3BBB')).toBe(1)
    expect(await total('search=b%201')).toBe(1)

    const sorted = await request('GET', `${URL}?sort=-kondisi`)
    expect(sorted.body.data.map((k: { kondisi: string }) => k.kondisi)).toEqual([
      'rusak_berat',
      'rusak_ringan',
      'baik',
    ])

    const invalid = await request('GET', `${URL}?kondisi=hancur`)
    expect(invalid.status).toBe(422)
  })
})
