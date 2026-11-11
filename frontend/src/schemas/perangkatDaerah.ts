import { z } from 'zod'

export const perangkatDaerahSchema = z.object({
  nama: z
    .string({ required_error: 'Nama perangkat daerah wajib diisi' })
    .trim()
    .min(1, 'Nama perangkat daerah wajib diisi')
    .max(150, 'Nama maksimal 150 karakter'),
})

export type PerangkatDaerahForm = z.infer<typeof perangkatDaerahSchema>
