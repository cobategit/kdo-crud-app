import { t } from 'elysia'
import { GOLONGAN, KONDISI_KENDARAAN } from '../../db/schema'
import { PageQuery, RefPerangkatDaerah, Timestamps, Uuid } from '../../lib/schemas'

export const PEGAWAI_SORT = ['nama', 'golongan', 'nip', 'jabatan', 'created_at'] as const

const Golongan = t.UnionEnum([...GOLONGAN], {
  error: `Golongan harus salah satu dari ${GOLONGAN[0]} s.d. ${GOLONGAN[GOLONGAN.length - 1]}`,
})

export const PegawaiModel = {
  body: t.Object({
    nama: t.String({
      minLength: 1,
      maxLength: 150,
      error: 'Nama wajib diisi (maksimal 150 karakter)',
    }),
    nip: t.String({
      pattern: '^[0-9]{18}$',
      error: 'NIP harus 18 digit angka',
      examples: ['198501012010011001'],
    }),
    jabatan: t.String({
      minLength: 1,
      maxLength: 150,
      error: 'Jabatan wajib diisi (maksimal 150 karakter)',
    }),
    golongan: Golongan,
    perangkat_daerah_id: Uuid('Perangkat daerah'),
  }),
  listQuery: t.Object({
    ...PageQuery,
    perangkat_daerah_id: t.Optional(Uuid('perangkat_daerah_id')),
    // String biasa: Elysia mengisi nilai default pada UnionEnum opsional di query string.
    golongan: t.Optional(t.String({ description: `Salah satu dari: ${GOLONGAN.join(', ')}` })),
    sort: t.Optional(
      t.String({
        description: `Salah satu dari: ${PEGAWAI_SORT.join(', ')}; awali "-" untuk menurun`,
      }),
    ),
  }),
  item: t.Object({
    id: t.String(),
    nama: t.String(),
    nip: t.String(),
    jabatan: t.String(),
    golongan: t.String(),
    perangkat_daerah_id: t.String(),
    perangkat_daerah: RefPerangkatDaerah,
    jumlah_kendaraan: t.Number(),
    ...Timestamps,
  }),
  get detail() {
    return t.Composite([
      this.item,
      t.Object({
        kendaraan: t.Array(
          t.Object({
            id: t.String(),
            nomor_polisi: t.String(),
            merek: t.String(),
            tipe_model: t.String(),
            tahun_produksi: t.Number(),
            kondisi: t.UnionEnum([...KONDISI_KENDARAAN]),
          }),
        ),
      }),
    ])
  },
}

export type PegawaiBody = typeof PegawaiModel.body.static
export type PegawaiListQuery = typeof PegawaiModel.listQuery.static
export type PegawaiItem = typeof PegawaiModel.item.static
