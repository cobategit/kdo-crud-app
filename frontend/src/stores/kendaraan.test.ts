import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dashboardApi } from '@/api/dashboard'
import { kendaraanApi } from '@/api/kendaraan'
import { kendaraan, meta } from '@/test/factories'
import { useDashboardStore } from './dashboard'
import { useKendaraanStore } from './kendaraan'

vi.mock('@/api/kendaraan', () => ({
  kendaraanApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    updateKondisi: vi.fn(),
  },
}))
vi.mock('@/api/dashboard', () => ({ dashboardApi: { ringkasan: vi.fn() } }))

const api = vi.mocked(kendaraanApi)
const dashApi = vi.mocked(dashboardApi)
const ringkasan = {
  kendaraan: { total: 1, baik: 1, rusak_ringan: 0, rusak_berat: 0, tanpa_penanggung_jawab: 1 },
  total_pegawai: 0,
  total_perangkat_daerah: 1,
  per_perangkat_daerah: [],
}

describe('useKendaraanStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    dashApi.ringkasan.mockResolvedValue(ringkasan)
  })

  it('updateKondisi memperbarui item list & current secara lokal', async () => {
    api.list.mockResolvedValue({ items: [kendaraan(), kendaraan({ id: 'k-2' })], meta: meta(2) })
    api.get.mockResolvedValue(kendaraan())
    api.updateKondisi.mockResolvedValue(kendaraan({ kondisi: 'rusak_berat' }))
    const store = useKendaraanStore()
    await store.fetchList()
    await store.fetchById('k-1')

    await store.updateKondisi('k-1', 'rusak_berat')
    expect(api.updateKondisi).toHaveBeenCalledWith('k-1', 'rusak_berat')
    expect(store.items.find((k) => k.id === 'k-1')?.kondisi).toBe('rusak_berat')
    expect(store.items.find((k) => k.id === 'k-2')?.kondisi).toBe('baik')
    expect(store.current?.kondisi).toBe('rusak_berat')
    expect(api.list).toHaveBeenCalledTimes(1)
  })

  it('me-refresh dashboard yang sudah dimuat setelah perubahan data kendaraan', async () => {
    const dashboard = useDashboardStore()
    await dashboard.fetch()
    expect(dashApi.ringkasan).toHaveBeenCalledTimes(1)

    api.create.mockResolvedValue(kendaraan())
    const store = useKendaraanStore()
    await store.create({
      nomor_polisi: 'B 1234 ABC',
      merek: 'Toyota',
      tipe_model: 'Avanza',
      tahun_produksi: 2020,
      warna: 'Hitam',
      kondisi: 'baik',
      perangkat_daerah_id: 'pd-1',
      pegawai_id: null,
      keterangan: null,
    })
    expect(dashApi.ringkasan).toHaveBeenCalledTimes(2)

    api.updateKondisi.mockResolvedValue(kendaraan({ kondisi: 'rusak_ringan' }))
    await store.updateKondisi('k-1', 'rusak_ringan')
    expect(dashApi.ringkasan).toHaveBeenCalledTimes(3)
  })

  it('tidak memuat dashboard bila belum pernah dibuka', async () => {
    api.remove.mockResolvedValue()
    await useKendaraanStore().remove('k-1')
    expect(dashApi.ringkasan).not.toHaveBeenCalled()
  })
})
