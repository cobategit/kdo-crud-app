<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import KondisiQuickSelect from '@/components/kendaraan/KondisiQuickSelect.vue'
import Badge from '@/components/ui/Badge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Pagination from '@/components/ui/Pagination.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import { useDebounceFn } from '@/composables/useDebounce'
import { useQueryFilters } from '@/composables/useQueryFilters'
import { useKendaraanStore } from '@/stores/kendaraan'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import { type Kendaraan, KONDISI_KENDARAAN } from '@/types/models'
import { KONDISI_LABEL } from '@/utils/kondisi'
import { tahunBerjalan } from '@/utils/nomorPolisi'

const store = useKendaraanStore()
const pdStore = usePerangkatDaerahStore()
const { filters, update, reset, isFiltered } = useQueryFilters({
  search: '',
  kondisi: '',
  perangkat_daerah_id: '',
  tahun_produksi: 0,
  tanpa_penanggung_jawab: false,
  pegawai_id: '',
  sort: 'nomor_polisi',
  page: 1,
  per_page: 10,
})

const columns: Column[] = [
  { key: 'nomor_polisi', label: 'Nomor Polisi', sortable: true },
  { key: 'merek', label: 'Kendaraan', sortable: true, class: 'hidden sm:table-cell' },
  { key: 'tahun_produksi', label: 'Tahun', sortable: true, class: 'hidden sm:table-cell' },
  { key: 'kondisi', label: 'Kondisi', sortable: true },
  { key: 'perangkat_daerah', label: 'Perangkat Daerah', class: 'hidden xl:table-cell' },
  { key: 'penanggung_jawab', label: 'Penanggung Jawab', class: 'hidden md:table-cell' },
  { key: 'aksi', label: 'Aksi', class: 'text-right w-px' },
]

const kondisiOptions = KONDISI_KENDARAAN.map((k) => ({ value: k, label: KONDISI_LABEL[k] }))
const pdOptions = computed(() => pdStore.options.map((p) => ({ value: p.id, label: p.nama })))
const tahunOptions = Array.from({ length: tahunBerjalan() - 1979 }, (_, i) => {
  const y = String(tahunBerjalan() - i)
  return { value: y, label: y }
})
onMounted(() => void pdStore.fetchOptions())

const search = ref(filters.value.search)
const pushSearch = useDebounceFn((value: string) => void update({ search: value.trim() }), 300)
watch(search, (v) => pushSearch(v))
watch(
  () => filters.value.search,
  (v) => {
    if (v !== search.value.trim()) search.value = v
  },
)

watch(
  filters,
  (f) =>
    void store.fetchList({
      page: f.page,
      per_page: f.per_page,
      sort: f.sort,
      search: f.search || undefined,
      kondisi: f.kondisi || undefined,
      perangkat_daerah_id: f.perangkat_daerah_id || undefined,
      pegawai_id: f.pegawai_id || undefined,
      tahun_produksi: f.tahun_produksi || undefined,
      tanpa_penanggung_jawab: f.tanpa_penanggung_jawab || undefined,
    }),
  { immediate: true },
)

const del = useConfirmDelete<Kendaraan>({
  remove: (k) => store.remove(k.id),
  successMessage: (k) => `Kendaraan ${k.nomor_polisi} telah dihapus.`,
  onSuccess: () => {
    if (store.items.length === 0 && filters.value.page > 1) void update({ page: filters.value.page - 1 })
  },
})

function resetAll() {
  search.value = ''
  void reset()
}
</script>

<template>
  <div>
    <PageHeader title="Kendaraan Dinas" description="Data kendaraan dinas operasional, kondisi, dan penanggung jawabnya.">
      <template #actions>
        <BaseButton icon="plus" to="/kendaraan/baru">Tambah Kendaraan</BaseButton>
      </template>
    </PageHeader>

    <div class="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SearchInput v-model="search" placeholder="Cari nomor polisi, merek, tipe..." />
        <BaseSelect
          :model-value="filters.perangkat_daerah_id"
          :options="pdOptions"
          placeholder="Semua perangkat daerah"
          aria-label="Filter perangkat daerah"
          @update:model-value="update({ perangkat_daerah_id: $event ?? '' })"
        />
        <BaseSelect
          :model-value="filters.kondisi"
          :options="kondisiOptions"
          placeholder="Semua kondisi"
          aria-label="Filter kondisi"
          @update:model-value="update({ kondisi: $event ?? '' })"
        />
        <BaseSelect
          :model-value="filters.tahun_produksi ? String(filters.tahun_produksi) : ''"
          :options="tahunOptions"
          placeholder="Semua tahun produksi"
          aria-label="Filter tahun produksi"
          @update:model-value="update({ tahun_produksi: Number($event) || 0 })"
        />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
            :checked="filters.tanpa_penanggung_jawab"
            @change="update({ tanpa_penanggung_jawab: ($event.target as HTMLInputElement).checked })"
          />
          Hanya tanpa penanggung jawab
        </label>
        <div class="flex items-center gap-2">
          <Badge v-if="filters.pegawai_id" tone="brand">
            Filter penanggung jawab
            <button type="button" class="ml-1 font-bold" aria-label="Hapus filter penanggung jawab" @click="update({ pegawai_id: '' })">×</button>
          </Badge>
          <BaseButton v-if="isFiltered" size="sm" variant="ghost" @click="resetAll">Reset filter</BaseButton>
        </div>
      </div>
    </div>

    <div v-if="store.error" class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      {{ store.error.message }}
      <button type="button" class="ml-2 font-medium underline" @click="store.fetchList()">Coba lagi</button>
    </div>

    <DataTable
      :columns="columns"
      :rows="store.items"
      :loading="store.loading"
      :sort="filters.sort"
      :empty-title="isFiltered ? 'Tidak ada kendaraan yang cocok' : 'Belum ada kendaraan'"
      :empty-description="isFiltered ? 'Ubah kata kunci atau filter pencarian.' : 'Tambahkan kendaraan dinas pertama.'"
      @sort="update({ sort: $event })"
    >
      <template #cell-nomor_polisi="{ row }">
        <RouterLink :to="`/kendaraan/${row.id}`" class="whitespace-nowrap font-mono text-sm font-semibold text-slate-900 hover:text-brand-700">
          {{ row.nomor_polisi }}
        </RouterLink>
        <span class="block text-xs text-slate-500 sm:hidden">{{ row.merek }} {{ row.tipe_model }}</span>
      </template>
      <template #cell-merek="{ row }">
        <span class="block font-medium text-slate-900">{{ row.merek }}</span>
        <span class="block text-xs text-slate-500">{{ row.tipe_model }} · {{ row.warna }}</span>
      </template>
      <template #cell-tahun_produksi="{ row }"><span class="tabular-nums">{{ row.tahun_produksi }}</span></template>
      <template #cell-kondisi="{ row }"><KondisiQuickSelect :kendaraan="row" /></template>
      <template #cell-perangkat_daerah="{ row }">
        <RouterLink :to="`/perangkat-daerah/${row.perangkat_daerah.id}`" class="hover:text-brand-700">{{ row.perangkat_daerah.nama }}</RouterLink>
      </template>
      <template #cell-penanggung_jawab="{ row }">
        <RouterLink v-if="row.penanggung_jawab" :to="`/pegawai/${row.penanggung_jawab.id}`" class="hover:text-brand-700">
          <span class="block">{{ row.penanggung_jawab.nama }}</span>
          <span class="block text-xs text-slate-500">{{ row.penanggung_jawab.jabatan }}</span>
        </RouterLink>
        <Badge v-else tone="warning">Belum ada</Badge>
      </template>
      <template #cell-aksi="{ row }">
        <div class="flex justify-end gap-1">
          <BaseButton size="sm" variant="ghost" icon="edit" :to="`/kendaraan/${row.id}/ubah`" aria-label="Ubah"><span class="hidden sm:inline">Ubah</span></BaseButton>
          <BaseButton size="sm" variant="ghost" icon="trash" class="text-red-600 hover:text-red-700" @click="del.ask(row)" aria-label="Hapus"><span class="hidden sm:inline">Hapus</span></BaseButton>
        </div>
      </template>
      <template #footer>
        <Pagination :meta="store.meta" @update:page="update({ page: $event })" @update:per-page="update({ per_page: $event })" />
      </template>
    </DataTable>

    <ConfirmDialog
      :open="del.open.value"
      :loading="del.loading.value"
      :error="del.error.value"
      :message="`Hapus kendaraan ${del.target.value?.nomor_polisi} (${del.target.value?.merek} ${del.target.value?.tipe_model})? Tindakan ini tidak dapat dibatalkan.`"
      @confirm="del.confirm"
      @cancel="del.cancel"
    />
  </div>
</template>
