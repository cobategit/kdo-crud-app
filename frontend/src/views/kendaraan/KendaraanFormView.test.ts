import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import { kendaraanApi } from '@/api/kendaraan'
import { pegawaiApi } from '@/api/pegawai'
import { perangkatDaerahApi } from '@/api/perangkatDaerah'
import PenanggungJawabSelect from '@/components/kendaraan/PenanggungJawabSelect.vue'
import { kendaraan, meta, pd, pegawai } from '@/test/factories'
import KendaraanFormView from './KendaraanFormView.vue'

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
vi.mock('@/api/pegawai', () => ({
  pegawaiApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/api/perangkatDaerah', () => ({
  perangkatDaerahApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/api/dashboard', () => ({ dashboardApi: { ringkasan: vi.fn() } }))

const kApi = vi.mocked(kendaraanApi)

async function mountForm(props: Record<string, unknown> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/kendaraan', component: { template: '<div />' } },
      { path: '/kendaraan/:id', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  const wrapper = mount(KendaraanFormView, {
    props,
    global: { plugins: [router] },
    attachTo: document.body,
  })
  await flushPromises()
  return { wrapper, router }
}

async function fillValid(wrapper: Awaited<ReturnType<typeof mountForm>>['wrapper']) {
  await wrapper.get('[data-testid=nopol] input').setValue('b1234abc')
  const inputs = wrapper.findAll('input[type=text], input[type=number]')
  const byPlaceholder = (p: string) => inputs.find((i) => i.attributes('placeholder') === p)!
  await byPlaceholder('mis. Toyota').setValue('Toyota')
  await byPlaceholder('mis. Innova Reborn 2.4 G').setValue('Avanza')
  await byPlaceholder('mis. Hitam').setValue('Hitam')
  await wrapper.get('input[type=number]').setValue('2020')
  await wrapper.get('[data-testid=pd-select] select').setValue('pd-1')
}

describe('KendaraanFormView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(perangkatDaerahApi.list).mockResolvedValue({
      items: [
        pd({ id: 'pd-1', nama: 'Dinas Kesehatan' }),
        pd({ id: 'pd-2', nama: 'Dinas Pendidikan' }),
      ],
      meta: meta(2),
    })
    vi.mocked(pegawaiApi.list).mockResolvedValue({ items: [pegawai({ id: 'p1' })], meta: meta(1) })
  })

  it('mengubah nomor polisi menjadi huruf besar saat diketik dan menormalisasi saat blur', async () => {
    const { wrapper } = await mountForm()
    const input = wrapper.get('[data-testid=nopol] input')
    await input.setValue('b1234abc')
    expect((input.element as HTMLInputElement).value).toBe('B1234ABC')
    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe('B 1234 ABC')
    wrapper.unmount()
  })

  it('mengosongkan penanggung jawab saat perangkat daerah diganti', async () => {
    const { wrapper } = await mountForm()
    await wrapper.get('[data-testid=pd-select] select').setValue('pd-1')
    const pj = wrapper.getComponent(PenanggungJawabSelect)
    expect(pj.props('perangkatDaerahId')).toBe('pd-1')
    pj.vm.$emit('update:modelValue', 'p1')
    await flushPromises()
    expect(pj.props('modelValue')).toBe('p1')

    await wrapper.get('[data-testid=pd-select] select').setValue('pd-2')
    await flushPromises()
    expect(pj.props('perangkatDaerahId')).toBe('pd-2')
    expect(pj.props('modelValue')).toBeNull()
    wrapper.unmount()
  })

  it('mengirim payload ternormalisasi lalu membuka halaman detail', async () => {
    kApi.create.mockResolvedValue(kendaraan({ id: 'k-new' }))
    const { wrapper, router } = await mountForm()
    await fillValid(wrapper)
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(kApi.create).toHaveBeenCalled())
    expect(kApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nomor_polisi: 'B 1234 ABC',
        tahun_produksi: 2020,
        kondisi: 'baik',
        perangkat_daerah_id: 'pd-1',
        pegawai_id: null,
        keterangan: null,
      }),
    )
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/kendaraan/k-new'))
    wrapper.unmount()
  })

  it('menolak submit dengan validasi klien (tahun & nomor polisi)', async () => {
    const { wrapper } = await mountForm()
    await fillValid(wrapper)
    await wrapper.get('[data-testid=nopol] input').setValue('1234')
    await wrapper.get('input[type=number]').setValue('1970')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Format nomor polisi tidak valid')
      expect(wrapper.text()).toContain('Tahun produksi harus antara 1980')
    })
    expect(kApi.create).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('menampilkan pesan error validasi dari backend per field', async () => {
    kApi.create.mockRejectedValue(
      new ApiError(409, 'DATA_DUPLIKAT', 'Nomor polisi sudah terdaftar', [
        { field: 'nomor_polisi', message: 'Nomor polisi sudah terdaftar' },
      ]),
    )
    const { wrapper } = await mountForm()
    await fillValid(wrapper)
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() =>
      expect(wrapper.get('[data-testid=nopol]').text()).toContain('Nomor polisi sudah terdaftar'),
    )
    wrapper.unmount()
  })
})
