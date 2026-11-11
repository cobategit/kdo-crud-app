import { z } from 'zod'
import { GOLONGAN } from '@/types/models'

export const pegawaiSchema = z.object({
  nama: z
    .string({ required_error: 'Nama wajib diisi' })
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(150, 'Nama maksimal 150 karakter'),
  nip: z
    .string({ required_error: 'NIP wajib diisi' })
    .trim()
    .regex(/^\d{18}$/, 'NIP harus 18 digit angka'),
  jabatan: z
    .string({ required_error: 'Jabatan wajib diisi' })
    .trim()
    .min(1, 'Jabatan wajib diisi')
    .max(150, 'Jabatan maksimal 150 karakter'),
  golongan: z.enum(GOLONGAN, {
    errorMap: () => ({ message: 'Pilih golongan (I/a s.d. IV/e)' }),
  }),
  perangkat_daerah_id: z
    .string({ required_error: 'Pilih perangkat daerah' })
    .min(1, 'Pilih perangkat daerah'),
})

export type PegawaiForm = z.infer<typeof pegawaiSchema>
