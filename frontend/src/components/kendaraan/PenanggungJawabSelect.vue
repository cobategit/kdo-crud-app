<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import FormField from '@/components/ui/FormField.vue'
import { fieldClass } from '@/components/ui/fieldClasses'
import { useDebounceFn } from '@/composables/useDebounce'
import { usePegawaiStore } from '@/stores/pegawai'
import type { PenanggungJawab } from '@/types/models'

type Option = Pick<PenanggungJawab, 'id' | 'nama' | 'nip' | 'jabatan'>

/**
 * Dropdown penanggung jawab yang dapat dicari. Hanya menampilkan pegawai dari
 * perangkat daerah terpilih (nama + NIP + jabatan). Nonaktif bila perangkat daerah belum dipilih.
 */
const props = defineProps<{
  perangkatDaerahId: string | null | undefined
  /** Data penanggung jawab saat ini (mode ubah) agar label langsung tampil. */
  initial?: Option | null
  label?: string
  error?: string
  id?: string
}>()
const model = defineModel<string | null>({ default: null })

const store = usePegawaiStore()
const autoId = useId()
const inputId = props.id ?? autoId
const listboxId = `${inputId}-listbox`

const options = ref<Option[]>([])
const selected = ref<Option | null>(props.initial ?? null)
const query = ref('')
const open = ref(false)
const loading = ref(false)
const loadError = ref<string | null>(null)
const activeIndex = ref(-1)
let requestId = 0

const disabled = computed(() => !props.perangkatDaerahId)

/** Indeks 0 = "Tanpa penanggung jawab", sisanya pegawai. */
const entries = computed<(Option | null)[]>(() => [null, ...options.value])

const displayValue = computed(() => {
  if (open.value) return query.value
  return selected.value ? `${selected.value.nama} — ${selected.value.nip}` : ''
})

const placeholder = computed(() =>
  disabled.value ? 'Pilih perangkat daerah terlebih dahulu' : 'Cari nama atau NIP pegawai...',
)

async function load(search = '') {
  const pdId = props.perangkatDaerahId
  if (!pdId) return
  const current = ++requestId
  loading.value = true
  loadError.value = null
  try {
    const result = await store.fetchOptions(pdId, search)
    if (current !== requestId) return
    options.value = result
    if (model.value && !selected.value) {
      selected.value = result.find((o) => o.id === model.value) ?? null
    }
  } catch (e) {
    if (current === requestId) loadError.value = (e as Error).message
  } finally {
    if (current === requestId) loading.value = false
  }
}

const debouncedLoad = useDebounceFn((search: string) => void load(search), 300)

watch(
  () => props.perangkatDaerahId,
  (pdId) => {
    options.value = []
    query.value = ''
    if (pdId) void load()
  },
  { immediate: true },
)

watch(model, (value) => {
  if (!value) selected.value = null
  else if (selected.value?.id !== value) {
    selected.value = options.value.find((o) => o.id === value) ?? props.initial ?? null
  }
})

watch(
  () => props.initial,
  (initial) => {
    if (initial && model.value === initial.id) selected.value = initial
  },
)

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  open.value = true
  activeIndex.value = 0
  debouncedLoad(query.value)
}

function openList() {
  if (disabled.value) return
  if (!open.value) {
    open.value = true
    query.value = ''
    activeIndex.value = Math.max(0, entries.value.findIndex((e) => (e?.id ?? null) === model.value))
    if (!options.value.length) void load()
  }
}

function close() {
  open.value = false
  query.value = ''
  debouncedLoad.cancel()
}

function choose(option: Option | null) {
  selected.value = option
  model.value = option?.id ?? null
  close()
}

function onKeydown(event: KeyboardEvent) {
  if (disabled.value) return
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) return openList()
      activeIndex.value = Math.min(entries.value.length - 1, activeIndex.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = Math.max(0, activeIndex.value - 1)
      break
    case 'Enter':
      if (open.value && activeIndex.value >= 0) {
        event.preventDefault()
        choose(entries.value[activeIndex.value] ?? null)
      }
      break
    case 'Escape':
      if (open.value) {
        event.preventDefault()
        close()
      }
      break
  }
}

const optionId = (i: number) => `${inputId}-opt-${i}`
</script>

<template>
  <FormField
    :id="inputId"
    :label="label ?? 'Penanggung Jawab'"
    :error="error"
    :hint="disabled ? undefined : 'Opsional. Hanya pegawai dari perangkat daerah terpilih.'"
  >
    <div class="relative">
      <input
        :id="inputId"
        type="text"
        role="combobox"
        autocomplete="off"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="listboxId"
        aria-autocomplete="list"
        :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :class="[fieldClass(error), 'pr-16']"
        data-testid="pj-input"
        @focus="openList"
        @click="openList"
        @input="onInput"
        @keydown="onKeydown"
        @blur="close"
      />
      <div class="absolute inset-y-0 right-2 flex items-center gap-1">
        <button
          v-if="selected && !disabled"
          type="button"
          class="rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label="Kosongkan penanggung jawab"
          data-testid="pj-clear"
          @mousedown.prevent
          @click="choose(null)"
        >
          <AppIcon name="close" class="h-3.5 w-3.5" />
        </button>
        <AppIcon name="chevron-down" class="pointer-events-none h-4 w-4 text-slate-400" />
      </div>

      <ul
        v-show="open"
        :id="listboxId"
        role="listbox"
        :aria-label="label ?? 'Penanggung Jawab'"
        class="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-slate-200"
      >
        <li
          v-for="(entry, i) in entries"
          :id="optionId(i)"
          :key="entry?.id ?? 'none'"
          role="option"
          :aria-selected="(entry?.id ?? null) === model"
          class="cursor-pointer px-3 py-2"
          :class="[
            i === activeIndex ? 'bg-brand-50' : '',
            (entry?.id ?? null) === model ? 'font-medium' : '',
          ]"
          data-testid="pj-option"
          @mousedown.prevent
          @mouseenter="activeIndex = i"
          @click="choose(entry)"
        >
          <template v-if="entry">
            <span class="block text-slate-900">{{ entry.nama }}</span>
            <span class="block text-xs text-slate-500">NIP {{ entry.nip }} · {{ entry.jabatan }}</span>
          </template>
          <span v-else class="italic text-slate-500">— Tanpa penanggung jawab —</span>
        </li>
        <li v-if="loading" class="px-3 py-2 text-xs text-slate-500" aria-live="polite">Memuat pegawai...</li>
        <li v-else-if="loadError" class="px-3 py-2 text-xs text-red-600">{{ loadError }}</li>
        <li v-else-if="options.length === 0" class="px-3 py-2 text-xs text-slate-500">
          {{ query ? 'Pegawai tidak ditemukan.' : 'Belum ada pegawai di perangkat daerah ini.' }}
        </li>
      </ul>
    </div>
  </FormField>
</template>
