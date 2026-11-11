import type { Pegawai, PegawaiDetail, PegawaiListParams, PegawaiPayload } from '@/types/models'
import { createCrudApi } from './crud'

export const pegawaiApi = createCrudApi<Pegawai, PegawaiDetail, PegawaiPayload, PegawaiListParams>(
  '/pegawai',
)
