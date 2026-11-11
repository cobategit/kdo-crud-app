<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useKendaraanStore } from '@/stores/kendaraan'
import { type Kendaraan, KONDISI_KENDARAAN, type KondisiKendaraan } from '@/types/models'
import { KONDISI_LABEL, KONDISI_STYLE } from '@/utils/kondisi'

/** Aksi cepat ubah kondisi (PATCH) dari halaman daftar/detail; tampil sebagai badge berwarna. */
const props = defineProps<{ kendaraan: Pick<Kendaraan, 'id' | 'kondisi' | 'nomor_polisi'> }>()

const store = useKendaraanStore()
const toast = useToast()
const saving = ref(false)

async function onChange(event: Event) {
  const select = event.target as HTMLSelectElement
  const kondisi = select.value as KondisiKendaraan
  if (kondisi === props.kendaraan.kondisi) return
  saving.value = true
  try {
    await store.updateKondisi(props.kendaraan.id, kondisi)
    toast.success('Kondisi diperbarui', `${props.kendaraan.nomor_polisi}: ${KONDISI_LABEL[kondisi]}`)
  } catch (e) {
    select.value = props.kendaraan.kondisi
    toast.error('Gagal mengubah kondisi', (e as Error).message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <label class="relative inline-flex items-center">
    <span class="sr-only">Ubah kondisi {{ kendaraan.nomor_polisi }}</span>
    <span
      class="pointer-events-none absolute left-2.5 h-1.5 w-1.5 rounded-full"
      :class="KONDISI_STYLE[kendaraan.kondisi].dot"
      aria-hidden="true"
    />
    <select
      :value="kendaraan.kondisi"
      :disabled="saving"
      class="cursor-pointer appearance-none rounded-full border-0 py-0.5 pl-6 pr-6 text-xs font-medium ring-1 ring-inset focus:ring-2 focus:ring-brand-600 disabled:cursor-wait disabled:opacity-60"
      :class="KONDISI_STYLE[kendaraan.kondisi].badge"
      title="Klik untuk mengubah kondisi"
      @change="onChange"
    >
      <option v-for="k in KONDISI_KENDARAAN" :key="k" :value="k">{{ KONDISI_LABEL[k] }}</option>
    </select>
    <svg class="pointer-events-none absolute right-2 h-3 w-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </label>
</template>
