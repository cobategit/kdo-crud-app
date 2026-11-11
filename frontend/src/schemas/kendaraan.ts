import { z } from 'zod'
import { KONDISI_KENDARAAN } from '@/types/models'
import { NOMOR_POLISI_PATTERN, normalizeNomorPolisi, tahunBerjalan } from '@/utils/nomorPolisi'

export const kendaraanSchema = z.object({
  nomor_polisi: z
    .string({ required_error: 'Nomor polisi wajib diisi' })
    .trim()
    .min(1, 'Nomor polisi wajib diisi')
    .transform(normalizeNomorPolisi)
    .refine(
      (v) => NOMOR_POLISI_PATTERN.test(v),
      'Format nomor polisi tidak valid (contoh: B 1234 ABC)',
    ),
  merek: z
    .string({ required_error: 'Merek wajib diisi' })
    .trim()
    .min(1, 'Merek wajib diisi')
    .max(50, 'Merek maksimal 50 karakter'),
  tipe_model: z
    .string({ required_error: 'Tipe/model wajib diisi' })
    .trim()
    .min(1, 'Tipe/model wajib diisi')
    .max(100, 'Tipe/model maksimal 100 karakter'),
  tahun_produksi: z.coerce
    .number({ invalid_type_error: 'Tahun produksi wajib diisi' })
    .int('Tahun produksi harus bilangan bulat')
    .refine(
      (v) => v >= 1980 && v <= tahunBerjalan(),
      () => ({ message: `Tahun produksi harus antara 1980 dan ${tahunBerjalan()}` }),
    ),
  warna: z
    .string({ required_error: 'Warna wajib diisi' })
    .trim()
    .min(1, 'Warna wajib diisi')
    .max(30, 'Warna maksimal 30 karakter'),
  kondisi: z.enum(KONDISI_KENDARAAN, { errorMap: () => ({ message: 'Pilih kondisi kendaraan' }) }),
  perangkat_daerah_id: z
    .string({ required_error: 'Pilih perangkat daerah' })
    .min(1, 'Pilih perangkat daerah'),
  pegawai_id: z.string().nullable().optional(),
  keterangan: z.string().max(1000, 'Keterangan maksimal 1000 karakter').nullable().optional(),
})

export type KendaraanFormInput = z.input<typeof kendaraanSchema>
export type KendaraanFormOutput = z.output<typeof kendaraanSchema>
