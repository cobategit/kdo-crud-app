import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import { perangkatDaerahApi } from '@/api/perangkatDaerah'
import { meta, pd } from '@/test/factories'
import { useDashboardStore } from './dashboard'
import { usePerangkatDaerahStore } from './perangkatDaerah'

vi.mock('@/api/perangkatDaerah', () => ({
  perangkatDaerahApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/api/dashboard', () => ({ dashboardApi: { ringkasan: vi.fn().mockResolvedValue({}) } }))

const api = vi.mocked(perangkatDaerahApi)

describe('usePerangkatDaerahStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchList menyimpan items, meta, dan filter', async () => {
    api.list.mockResolvedValue({ items: [pd()], meta: meta(1) })
    const store = usePerangkatDaerahStore()
    await store.fetchList({ page: 1, per_page: 10, search: 'dinas' })
    expect(api.list).toHaveBeenCalledWith({ page: 1, per_page: 10, search: 'dinas' })
    expect(store.items).toHaveLength(1)
    expect(store.meta?.total).toBe(1)
    expect(store.filters.search).toBe('dinas')
    expect(store.loading).toBe(false)
  })

  it('fetchList menyimpan error tanpa melempar', async () => {
    api.list.mockRejectedValue(new ApiError(500, 'KESALAHAN_SERVER', 'Server error'))
    const store = usePerangkatDaerahStore()
    await store.fetchList()
    expect(store.error?.message).toBe('Server error')
    expect(store.items).toEqual([])
  })

  it('mengabaikan respons usang ketika filter berubah cepat', async () => {
    let resolveFirst!: (v: unknown) => void
    api.list
      .mockImplementationOnce(() => new Promise((r) => (resolveFirst = r)) as never)
      .mockResolvedValueOnce({ items: [pd({ id: 'baru', nama: 'Baru' })], meta: meta(1) })
    const store = usePerangkatDaerahStore()
    const first = store.fetchList({ search: 'lama' })
    await store.fetchList({ search: 'baru' })
    resolveFirst({ items: [pd({ id: 'lama' })], meta: meta(1) })
    await first
    expect(store.items[0]?.id).toBe('baru')
  })

  it('fetchById mengisi current', async () => {
    api.get.mockResolvedValue({
      ...pd(),
      rekap_kondisi: { baik: 0, rusak_ringan: 0, rusak_berat: 0, tanpa_penanggung_jawab: 0 },
    })
    const store = usePerangkatDaerahStore()
    await store.fetchById('pd-1')
    expect(store.current?.nama).toBe('Dinas Kesehatan')
  })

  it('create & update memanggil API, mengisi current, dan me-refresh dashboard', async () => {
    const detail = {
      ...pd(),
      rekap_kondisi: { baik: 0, rusak_ringan: 0, rusak_berat: 0, tanpa_penanggung_jawab: 0 },
    }
    api.create.mockResolvedValue(detail)
    api.update.mockResolvedValue({ ...detail, nama: 'Dinas Baru' })
    const store = usePerangkatDaerahStore()
    const dashboard = useDashboardStore()
    const invalidate = vi.spyOn(dashboard, 'invalidate')

    await store.create({ nama: 'Dinas Kesehatan' })
    expect(api.create).toHaveBeenCalledWith({ nama: 'Dinas Kesehatan' })
    await store.update('pd-1', { nama: 'Dinas Baru' })
    expect(store.current?.nama).toBe('Dinas Baru')
    expect(invalidate).toHaveBeenCalledTimes(2)
  })

  it('remove menghapus lalu memuat ulang list', async () => {
    api.list.mockResolvedValueOnce({ items: [pd(), pd({ id: 'pd-2' })], meta: meta(2) })
    api.list.mockResolvedValueOnce({ items: [pd({ id: 'pd-2' })], meta: meta(1) })
    api.remove.mockResolvedValue()
    const store = usePerangkatDaerahStore()
    await store.fetchList()
    await store.remove('pd-1')
    expect(api.remove).toHaveBeenCalledWith('pd-1')
    expect(api.list).toHaveBeenCalledTimes(2)
    expect(store.items.map((i) => i.id)).toEqual(['pd-2'])
  })

  it('remove meneruskan ApiError (mis. RELASI_MASIH_DIGUNAKAN)', async () => {
    api.remove.mockRejectedValue(
      new ApiError(409, 'RELASI_MASIH_DIGUNAKAN', 'Masih memiliki 2 pegawai'),
    )
    const store = usePerangkatDaerahStore()
    await expect(store.remove('pd-1')).rejects.toMatchObject({ code: 'RELASI_MASIH_DIGUNAKAN' })
    expect(store.saving).toBe(false)
  })
})
