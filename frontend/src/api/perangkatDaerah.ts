import type {
  ListParams,
  PerangkatDaerah,
  PerangkatDaerahDetail,
  PerangkatDaerahPayload,
} from '@/types/models'
import { createCrudApi } from './crud'

export const perangkatDaerahApi = createCrudApi<
  PerangkatDaerah,
  PerangkatDaerahDetail,
  PerangkatDaerahPayload,
  ListParams
>('/perangkat-daerah')
