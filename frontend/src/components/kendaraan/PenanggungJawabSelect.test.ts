import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pegawaiApi } from '@/api/pegawai'
import { meta, pegawai } from '@/test/factories'
import PenanggungJawabSelect from './PenanggungJawabSelect.vue'

vi.mock('@/api/pegawai', () => ({
  pegawaiApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
const api = vi.mocked(pegawaiApi)

const pegawaiPd1 = [
  pegawai({ id: 'p1', nama: 'Agus', nip: '197912282005011006', jabatan: 'Sekretaris' }),
  pegawai({ id: 'p2', nama: 'Siti', nip: '199205192019032008', jabatan: 'Apoteker' }),
]

function factory(props: Record<string, unknown> = {}) {
  return mount(PenanggungJawabSelect, {
    props: { perangkatDaerahId: 'pd-1', modelValue: null, ...props },
    attachTo: document.body,
  })
}

describe('PenanggungJawabSelect', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useRealTimers()
    api.list.mockResolvedValue({ items: pegawaiPd1, meta: meta(2) })
  })

  it('nonaktif dan tidak memuat data bila perangkat daerah belum dipilih', () => {
    const wrapper = factory({ perangkatDaerahId: '' })
    const input = wrapper.get('[data-testid=pj-input]')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('placeholder')).toBe('Pilih perangkat daerah terlebih dahulu')
    expect(api.list).not.toHaveBeenCalled()
  })

  it('hanya memuat pegawai dari perangkat daerah terpilih dan menampilkan nama + NIP + jabatan', async () => {
    const wrapper = factory()
    await flushPromises()
    expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ perangkat_daerah_id: 'pd-1' }))

    await wrapper.get('[data-testid=pj-input]').trigger('focus')
    const options = wrapper.findAll('[data-testid=pj-option]')
    expect(options).toHaveLength(3) // "Tanpa penanggung jawab" + 2 pegawai
    expect(options[1]?.text()).toContain('Agus')
    expect(options[1]?.text()).toContain('197912282005011006')
    expect(options[1]?.text()).toContain('Sekretaris')
    wrapper.unmount()
  })

  it('memancarkan id pegawai saat dipilih dan null saat dikosongkan', async () => {
    const wrapper = factory()
    await flushPromises()
    await wrapper.get('[data-testid=pj-input]').trigger('focus')
    await wrapper.findAll('[data-testid=pj-option]')[2]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['p2'])
    expect((wrapper.get('[data-testid=pj-input]').element as HTMLInputElement).value).toContain(
      'Siti',
    )

    await wrapper.setProps({ modelValue: 'p2' })
    await wrapper.get('[data-testid=pj-clear]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    wrapper.unmount()
  })

  it('mencari dengan debounce ±300 ms', async () => {
    vi.useFakeTimers()
    const wrapper = factory()
    await flushPromises()
    api.list.mockClear()

    const input = wrapper.get('[data-testid=pj-input]')
    await input.trigger('focus')
    await input.setValue('si')
    await input.setValue('sit')
    expect(api.list).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(api.list).toHaveBeenCalledTimes(1)
    expect(api.list).toHaveBeenCalledWith(
      expect.objectContaining({ perangkat_daerah_id: 'pd-1', search: 'sit' }),
    )
    wrapper.unmount()
  })

  it('memuat ulang opsi saat perangkat daerah berganti', async () => {
    const wrapper = factory()
    await flushPromises()
    await wrapper.setProps({ perangkatDaerahId: 'pd-2' })
    await flushPromises()
    expect(api.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ perangkat_daerah_id: 'pd-2' }),
    )
  })

  it('menampilkan label penanggung jawab awal pada mode ubah', () => {
    const wrapper = factory({
      modelValue: 'p9',
      initial: { id: 'p9', nama: 'Hendra', nip: '197807092003121003', jabatan: 'Kabid' },
    })
    expect((wrapper.get('[data-testid=pj-input]').element as HTMLInputElement).value).toBe(
      'Hendra — 197807092003121003',
    )
  })
})
