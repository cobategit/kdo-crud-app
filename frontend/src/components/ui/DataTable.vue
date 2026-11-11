<script setup lang="ts" generic="T extends { id: string }">
import AppIcon from './AppIcon.vue'
import EmptyState from './EmptyState.vue'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  /** Kelas tambahan untuk th & td (mis. `text-right`, `hidden md:table-cell`). */
  class?: string
}

const props = defineProps<{
  columns: Column[]
  rows: T[]
  loading?: boolean
  /** Nilai sort aktif, mis. `nama` atau `-tahun_produksi`. */
  sort?: string
  emptyTitle?: string
  emptyDescription?: string
  skeletonRows?: number
}>()

const emit = defineEmits<{ sort: [value: string]; rowClick: [row: T] }>()

function sortState(key: string): 'asc' | 'desc' | null {
  if (props.sort === key) return 'asc'
  if (props.sort === `-${key}`) return 'desc'
  return null
}

function toggleSort(key: string) {
  emit('sort', sortState(key) === 'asc' ? `-${key}` : key)
}

function ariaSort(key: string) {
  const s = sortState(key)
  return s === 'asc' ? 'ascending' : s === 'desc' ? 'descending' : 'none'
}

function cellValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="col.sortable ? ariaSort(col.key) : undefined"
              class="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              :class="col.class"
            >
              <button
                v-if="col.sortable"
                type="button"
                class="group inline-flex items-center gap-1 uppercase hover:text-slate-900"
                @click="toggleSort(col.key)"
              >
                {{ col.label }}
                <AppIcon
                  :name="sortState(col.key) === 'asc' ? 'sort-asc' : sortState(col.key) === 'desc' ? 'sort-desc' : 'sort'"
                  class="h-3.5 w-3.5"
                  :class="sortState(col.key) ? 'text-brand-700' : 'text-slate-300 group-hover:text-slate-500'"
                />
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <template v-if="loading && rows.length === 0">
            <tr v-for="i in skeletonRows ?? 5" :key="`sk-${i}`" aria-hidden="true">
              <td v-for="col in columns" :key="col.key" class="px-4 py-3.5" :class="col.class">
                <div class="h-4 animate-pulse rounded bg-slate-200" :style="{ width: `${50 + ((i * 17 + col.key.length * 7) % 40)}%` }" />
              </td>
            </tr>
          </template>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length">
              <EmptyState
                :title="emptyTitle ?? 'Belum ada data'"
                :description="emptyDescription"
              >
                <slot name="empty-action" />
              </EmptyState>
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="transition-colors hover:bg-slate-50"
              :class="{ 'opacity-60': loading }"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 align-middle text-slate-700"
                :class="col.class"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="cellValue(row, col.key)">
                  {{ cellValue(row, col.key) ?? '-' }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <slot name="footer" />
  </div>
</template>
