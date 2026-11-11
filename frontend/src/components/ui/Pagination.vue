<script setup lang="ts">
import { computed } from 'vue'
import type { PaginationMeta } from '@/types/api'
import { formatAngka } from '@/utils/format'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ meta: PaginationMeta | null; perPageOptions?: number[] }>()
const emit = defineEmits<{ 'update:page': [number]; 'update:perPage': [number] }>()

const from = computed(() =>
  props.meta && props.meta.total > 0 ? (props.meta.page - 1) * props.meta.per_page + 1 : 0,
)
const to = computed(() =>
  props.meta ? Math.min(props.meta.page * props.meta.per_page, props.meta.total) : 0,
)

/** Nomor halaman yang ditampilkan, dengan elipsis bila banyak. */
const pages = computed<(number | '…')[]>(() => {
  if (!props.meta) return []
  const { page, total_pages: total } = props.meta
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1]
    if (i > 0 && prev !== undefined && p - prev > 1) result.push('…')
    result.push(p)
  })
  return result
})

function go(page: number) {
  if (!props.meta || page < 1 || page > props.meta.total_pages || page === props.meta.page) return
  emit('update:page', page)
}
</script>

<template>
  <nav
    v-if="meta"
    class="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    aria-label="Navigasi halaman"
  >
    <div class="flex items-center gap-3 text-slate-600">
      <span>
        Menampilkan <strong class="font-medium text-slate-900">{{ formatAngka(from) }}–{{ formatAngka(to) }}</strong>
        dari <strong class="font-medium text-slate-900">{{ formatAngka(meta.total) }}</strong>
      </span>
      <label class="hidden items-center gap-1.5 sm:flex">
        <span class="sr-only">Baris per halaman</span>
        <select
          :value="meta.per_page"
          class="rounded-md border-0 py-1 pl-2 pr-7 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-600"
          @change="emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="n in perPageOptions ?? [10, 25, 50, 100]" :key="n" :value="n">{{ n }} / hal</option>
        </select>
      </label>
    </div>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        :disabled="meta.page <= 1"
        aria-label="Halaman sebelumnya"
        @click="go(meta.page - 1)"
      >
        <AppIcon name="chevron-left" class="h-4 w-4" />
      </button>
      <template v-for="(p, i) in pages" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="px-2 text-slate-400">…</span>
        <button
          v-else
          type="button"
          class="min-w-8 rounded-md px-2 py-1 text-sm font-medium"
          :class="p === meta.page ? 'bg-brand-700 text-white' : 'text-slate-700 hover:bg-slate-100'"
          :aria-current="p === meta.page ? 'page' : undefined"
          @click="go(p)"
        >
          {{ p }}
        </button>
      </template>
      <button
        type="button"
        class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        :disabled="meta.page >= meta.total_pages"
        aria-label="Halaman berikutnya"
        @click="go(meta.page + 1)"
      >
        <AppIcon name="chevron-right" class="h-4 w-4" />
      </button>
    </div>
  </nav>
</template>
