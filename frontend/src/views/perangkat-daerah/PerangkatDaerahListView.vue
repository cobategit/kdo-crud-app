<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Pagination from '@/components/ui/Pagination.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import { useDebounceFn } from '@/composables/useDebounce'
import { useQueryFilters } from '@/composables/useQueryFilters'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import type { PerangkatDaerah } from '@/types/models'
import { formatAngka } from '@/utils/format'

const store = usePerangkatDaerahStore()
const { filters, update } = useQueryFilters({ search: '', sort: 'nama', page: 1, per_page: 10 })

const columns: Column[] = [
  { key: 'nama', label: 'Nama Perangkat Daerah', sortable: true },
  { key: 'jumlah_pegawai', label: 'Pegawai', sortable: true, class: 'text-right' },
  { key: 'jumlah_kendaraan', label: 'Kendaraan', sortable: true, class: 'text-right' },
  { key: 'aksi', label: 'Aksi', class: 'text-right w-px' },
]

const search = ref(filters.value.search)
const pushSearch = useDebounceFn((value: string) => void update({ search: value.trim() }), 300)
watch(search, (v) => pushSearch(v))
watch(
  () => filters.value.search,
  (v) => {
    if (v !== search.value.trim()) search.value = v
  },
)

watch(filters, (f) => void store.fetchList({ ...f, search: f.search || undefined }), {
  immediate: true,
})

const del = useConfirmDelete<PerangkatDaerah>({
  remove: (pd) => store.remove(pd.id),
  successMessage: (pd) => `Perangkat daerah "${pd.nama}" telah dihapus.`,
  onSuccess: () => {
    if (store.items.length === 0 && filters.value.page > 1) void update({ page: filters.value.page - 1 })
  },
})
</script>

<template>
  <div>
    <PageHeader
      title="Perangkat Daerah"
      description="Instansi pemilik/pengguna kendaraan dinas operasional."
    >
      <template #actions>
        <BaseButton icon="plus" to="/perangkat-daerah/baru">Tambah Perangkat Daerah</BaseButton>
      </template>
    </PageHeader>

    <div class="mb-4 max-w-md">
      <SearchInput v-model="search" placeholder="Cari nama perangkat daerah..." />
    </div>

    <div
      v-if="store.error"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      {{ store.error.message }}
      <button type="button" class="ml-2 font-medium underline" @click="store.fetchList()">Coba lagi</button>
    </div>

    <DataTable
      :columns="columns"
      :rows="store.items"
      :loading="store.loading"
      :sort="filters.sort"
      :empty-title="filters.search ? 'Tidak ada hasil' : 'Belum ada perangkat daerah'"
      :empty-description="filters.search ? `Tidak ditemukan perangkat daerah dengan kata kunci “${filters.search}”.` : 'Tambahkan perangkat daerah pertama.'"
      @sort="update({ sort: $event })"
    >
      <template #cell-nama="{ row }">
        <RouterLink :to="`/perangkat-daerah/${row.id}`" class="font-medium text-slate-900 hover:text-brand-700">
          {{ row.nama }}
        </RouterLink>
      </template>
      <template #cell-jumlah_pegawai="{ row }">
        <RouterLink
          :to="{ path: '/pegawai', query: { perangkat_daerah_id: row.id } }"
          class="tabular-nums hover:text-brand-700 hover:underline"
        >
          {{ formatAngka(row.jumlah_pegawai) }}
        </RouterLink>
      </template>
      <template #cell-jumlah_kendaraan="{ row }">
        <RouterLink
          :to="{ path: '/kendaraan', query: { perangkat_daerah_id: row.id } }"
          class="tabular-nums hover:text-brand-700 hover:underline"
        >
          {{ formatAngka(row.jumlah_kendaraan) }}
        </RouterLink>
      </template>
      <template #cell-aksi="{ row }">
        <div class="flex justify-end gap-1">
          <BaseButton size="sm" variant="ghost" icon="edit" :to="`/perangkat-daerah/${row.id}/ubah`" aria-label="Ubah"><span class="hidden sm:inline">Ubah</span></BaseButton>
          <BaseButton size="sm" variant="ghost" icon="trash" class="text-red-600 hover:text-red-700" @click="del.ask(row)" aria-label="Hapus"><span class="hidden sm:inline">Hapus</span></BaseButton>
        </div>
      </template>
      <template #footer>
        <Pagination
          :meta="store.meta"
          @update:page="update({ page: $event })"
          @update:per-page="update({ per_page: $event })"
        />
      </template>
    </DataTable>

    <ConfirmDialog
      :open="del.open.value"
      :loading="del.loading.value"
      :error="del.error.value"
      :message="`Hapus perangkat daerah “${del.target.value?.nama}”? Tindakan ini tidak dapat dibatalkan.`"
      @confirm="del.confirm"
      @cancel="del.cancel"
    />
  </div>
</template>
