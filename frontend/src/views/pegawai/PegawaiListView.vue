<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
import { usePegawaiStore } from '@/stores/pegawai'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import { GOLONGAN, type Pegawai } from '@/types/models'

const store = usePegawaiStore()
const pdStore = usePerangkatDaerahStore()
const { filters, update, reset, isFiltered } = useQueryFilters({
  search: '',
  perangkat_daerah_id: '',
  golongan: '',
  sort: 'nama',
  page: 1,
  per_page: 10,
})

const columns: Column[] = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'nip', label: 'NIP', sortable: true, class: 'hidden md:table-cell' },
  { key: 'jabatan', label: 'Jabatan', class: 'hidden lg:table-cell' },
  { key: 'golongan', label: 'Gol.', sortable: true },
  { key: 'perangkat_daerah', label: 'Perangkat Daerah', class: 'hidden xl:table-cell' },
  { key: 'jumlah_kendaraan', label: 'Kendaraan', class: 'text-right hidden sm:table-cell' },
  { key: 'aksi', label: 'Aksi', class: 'text-right w-px' },
]

const pdOptions = computed(() => pdStore.options.map((p) => ({ value: p.id, label: p.nama })))
const golonganOptions = GOLONGAN.map((g) => ({ value: g, label: g }))
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
      ...f,
      search: f.search || undefined,
      perangkat_daerah_id: f.perangkat_daerah_id || undefined,
      golongan: f.golongan || undefined,
    }),
  { immediate: true },
)

const del = useConfirmDelete<Pegawai>({
  remove: (p) => store.remove(p.id),
  successMessage: (p) => `Pegawai “${p.nama}” telah dihapus.`,
  onSuccess: () => {
    if (store.items.length === 0 && filters.value.page > 1) void update({ page: filters.value.page - 1 })
  },
})
</script>

<template>
  <div>
    <PageHeader title="Pegawai" description="Pegawai perangkat daerah yang dapat menjadi penanggung jawab kendaraan.">
      <template #actions>
        <BaseButton icon="plus" to="/pegawai/baru">Tambah Pegawai</BaseButton>
      </template>
    </PageHeader>

    <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_auto]">
      <SearchInput v-model="search" placeholder="Cari nama atau NIP..." />
      <BaseSelect
        :model-value="filters.perangkat_daerah_id"
        :options="pdOptions"
        placeholder="Semua perangkat daerah"
        aria-label="Filter perangkat daerah"
        @update:model-value="update({ perangkat_daerah_id: $event ?? '' })"
      />
      <BaseSelect
        :model-value="filters.golongan"
        :options="golonganOptions"
        placeholder="Semua golongan"
        aria-label="Filter golongan"
        @update:model-value="update({ golongan: $event ?? '' })"
      />
      <BaseButton v-if="isFiltered" variant="ghost" @click="reset(); search = ''">Reset filter</BaseButton>
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
      :empty-title="isFiltered ? 'Tidak ada pegawai yang cocok' : 'Belum ada pegawai'"
      :empty-description="isFiltered ? 'Ubah kata kunci atau filter pencarian.' : 'Tambahkan pegawai pertama.'"
      @sort="update({ sort: $event })"
    >
      <template #cell-nama="{ row }">
        <RouterLink :to="`/pegawai/${row.id}`" class="font-medium text-slate-900 hover:text-brand-700">{{ row.nama }}</RouterLink>
        <p class="text-xs text-slate-500 md:hidden">{{ row.nip }}</p>
      </template>
      <template #cell-nip="{ row }"><span class="font-mono text-xs tabular-nums">{{ row.nip }}</span></template>
      <template #cell-golongan="{ row }"><Badge>{{ row.golongan }}</Badge></template>
      <template #cell-perangkat_daerah="{ row }">
        <RouterLink :to="`/perangkat-daerah/${row.perangkat_daerah.id}`" class="hover:text-brand-700">
          {{ row.perangkat_daerah.nama }}
        </RouterLink>
      </template>
      <template #cell-jumlah_kendaraan="{ row }">
        <RouterLink
          v-if="row.jumlah_kendaraan > 0"
          :to="{ path: '/kendaraan', query: { pegawai_id: row.id } }"
          class="tabular-nums hover:text-brand-700 hover:underline"
        >
          {{ row.jumlah_kendaraan }}
        </RouterLink>
        <span v-else class="text-slate-400">0</span>
      </template>
      <template #cell-aksi="{ row }">
        <div class="flex justify-end gap-1">
          <BaseButton size="sm" variant="ghost" icon="edit" :to="`/pegawai/${row.id}/ubah`" aria-label="Ubah"><span class="hidden sm:inline">Ubah</span></BaseButton>
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
      :message="`Hapus pegawai “${del.target.value?.nama}” (NIP ${del.target.value?.nip})? Tindakan ini tidak dapat dibatalkan.`"
      @confirm="del.confirm"
      @cancel="del.cancel"
    />
  </div>
</template>
