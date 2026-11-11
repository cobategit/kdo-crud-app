import { t } from 'elysia'
import { PageQuery, Timestamps } from '../../lib/schemas'

export const PERANGKAT_DAERAH_SORT = [
  'nama',
  'created_at',
  'jumlah_pegawai',
  'jumlah_kendaraan',
] as const

export const PerangkatDaerahModel = {
  body: t.Object({
    nama: t.String({
      minLength: 1,
      maxLength: 150,
      error: 'Nama perangkat daerah wajib diisi (maksimal 150 karakter)',
      examples: ['Dinas Perhubungan'],
    }),
  }),
  listQuery: t.Object({
    ...PageQuery,
    sort: t.Optional(
      t.String({
        description: `Salah satu dari: ${PERANGKAT_DAERAH_SORT.join(', ')}; awali "-" untuk menurun`,
      }),
    ),
  }),
  item: t.Object({
    id: t.String(),
    nama: t.String(),
    jumlah_pegawai: t.Number(),
    jumlah_kendaraan: t.Number(),
    ...Timestamps,
  }),
  detail: t.Object({
    id: t.String(),
    nama: t.String(),
    jumlah_pegawai: t.Number(),
    jumlah_kendaraan: t.Number(),
    rekap_kondisi: t.Object({
      baik: t.Number(),
      rusak_ringan: t.Number(),
      rusak_berat: t.Number(),
      tanpa_penanggung_jawab: t.Number(),
    }),
    ...Timestamps,
  }),
}

export type PerangkatDaerahBody = typeof PerangkatDaerahModel.body.static
export type PerangkatDaerahListQuery = typeof PerangkatDaerahModel.listQuery.static
export type PerangkatDaerahItem = typeof PerangkatDaerahModel.item.static
export type PerangkatDaerahDetail = typeof PerangkatDaerahModel.detail.static
