import { t } from 'elysia'
import { KONDISI_KENDARAAN } from '../../db/schema'
import { PageQuery, RefPerangkatDaerah, Timestamps, Uuid } from '../../lib/schemas'

export const KENDARAAN_SORT = [
  'nomor_polisi',
  'merek',
  'tipe_model',
  'tahun_produksi',
  'kondisi',
  'created_at',
] as const

const Kondisi = t.UnionEnum([...KONDISI_KENDARAAN], {
  error: 'Kondisi harus salah satu dari: baik, rusak_ringan, rusak_berat',
})

export const KendaraanModel = {
  body: t.Object({
    nomor_polisi: t.String({
      minLength: 1,
      maxLength: 20,
      error: 'Nomor polisi wajib diisi',
      examples: ['B 1234 ABC'],
    }),
    merek: t.String({
      minLength: 1,
      maxLength: 50,
      error: 'Merek wajib diisi (maksimal 50 karakter)',
    }),
    tipe_model: t.String({
      minLength: 1,
      maxLength: 100,
      error: 'Tipe/model wajib diisi (maksimal 100 karakter)',
    }),
    tahun_produksi: t.Integer({
      minimum: 1980,
      error: 'Tahun produksi harus bilangan bulat mulai 1980',
    }),
    warna: t.String({
      minLength: 1,
      maxLength: 30,
      error: 'Warna wajib diisi (maksimal 30 karakter)',
    }),
    kondisi: Kondisi,
    perangkat_daerah_id: Uuid('Perangkat daerah'),
    pegawai_id: t.Optional(t.Nullable(Uuid('Penanggung jawab'))),
    keterangan: t.Optional(
      t.Nullable(t.String({ maxLength: 1000, error: 'Keterangan maksimal 1000 karakter' })),
    ),
  }),
  kondisiBody: t.Object({ kondisi: Kondisi }),
  listQuery: t.Object({
    ...PageQuery,
    // String biasa: Elysia mengisi nilai default pada UnionEnum opsional di query string.
    kondisi: t.Optional(
      t.String({ description: `Salah satu dari: ${KONDISI_KENDARAAN.join(', ')}` }),
    ),
    perangkat_daerah_id: t.Optional(Uuid('perangkat_daerah_id')),
    pegawai_id: t.Optional(Uuid('pegawai_id')),
    tahun_produksi: t.Optional(
      t.Numeric({ minimum: 1980, maximum: 2100, error: 'tahun_produksi tidak valid' }),
    ),
    tanpa_penanggung_jawab: t.Optional(
      t.BooleanString({ error: 'tanpa_penanggung_jawab harus true/false' }),
    ),
    sort: t.Optional(
      t.String({
        description: `Salah satu dari: ${KENDARAAN_SORT.join(', ')}; awali "-" untuk menurun`,
      }),
    ),
  }),
  item: t.Object({
    id: t.String(),
    nomor_polisi: t.String(),
    merek: t.String(),
    tipe_model: t.String(),
    tahun_produksi: t.Number(),
    warna: t.String(),
    kondisi: Kondisi,
    perangkat_daerah_id: t.String(),
    pegawai_id: t.Nullable(t.String()),
    keterangan: t.Nullable(t.String()),
    perangkat_daerah: RefPerangkatDaerah,
    penanggung_jawab: t.Nullable(
      t.Object({
        id: t.String(),
        nama: t.String(),
        nip: t.String(),
        jabatan: t.String(),
        golongan: t.String(),
      }),
    ),
    ...Timestamps,
  }),
}

export type KendaraanBody = typeof KendaraanModel.body.static
export type KendaraanListQuery = typeof KendaraanModel.listQuery.static
export type KendaraanItem = typeof KendaraanModel.item.static
