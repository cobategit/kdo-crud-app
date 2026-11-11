<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/http'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import DetailSkeleton from '@/components/ui/DetailSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useToast } from '@/composables/useToast'
import { pegawaiSchema } from '@/schemas/pegawai'
import { usePegawaiStore } from '@/stores/pegawai'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import { GOLONGAN } from '@/types/models'
import { applyServerErrors } from '@/utils/formErrors'

const props = defineProps<{ id?: string }>()
const isEdit = computed(() => Boolean(props.id))
const FIELDS = ['nama', 'nip', 'jabatan', 'golongan', 'perangkat_daerah_id'] as const

const store = usePegawaiStore()
const pdStore = usePerangkatDaerahStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const loadError = ref<ApiError | null>(null)
const loadingData = ref(false)
const jumlahKendaraan = ref(0)

const { defineField, errors, handleSubmit, setErrors, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(pegawaiSchema),
  initialValues: {
    nama: '',
    nip: '',
    jabatan: '',
    perangkat_daerah_id: typeof route.query.perangkat_daerah_id === 'string' ? route.query.perangkat_daerah_id : '',
  },
})
const [nama] = defineField('nama')
const [nip] = defineField('nip')
const [jabatan] = defineField('jabatan')
const [golongan] = defineField('golongan')
const [perangkatDaerahId] = defineField('perangkat_daerah_id')

const pdOptions = computed(() => pdStore.options.map((p) => ({ value: p.id, label: p.nama })))
const golonganOptions = GOLONGAN.map((g) => ({ value: g, label: g }))

/** NIP hanya menerima digit (maks 18) saat diketik. */
function onNipInput(value: string | number | null | undefined) {
  nip.value = String(value ?? '').replace(/\D/g, '').slice(0, 18)
}

async function load() {
  loadError.value = null
  const pdPromise = pdStore.fetchOptions()
  if (!props.id) return void (await pdPromise)
  loadingData.value = true
  try {
    const [p] = await Promise.all([store.fetchById(props.id), pdPromise])
    jumlahKendaraan.value = p.jumlah_kendaraan
    resetForm({
      values: {
        nama: p.nama,
        nip: p.nip,
        jabatan: p.jabatan,
        golongan: p.golongan,
        perangkat_daerah_id: p.perangkat_daerah_id,
      },
    })
  } catch (e) {
    loadError.value = e as ApiError
  } finally {
    loadingData.value = false
  }
}
onMounted(load)

const onSubmit = handleSubmit(async (values) => {
  try {
    const saved = props.id ? await store.update(props.id, values) : await store.create(values)
    toast.success(props.id ? 'Perubahan disimpan' : 'Pegawai ditambahkan', `“${saved.nama}” berhasil disimpan.`)
    await router.push(`/pegawai/${saved.id}`)
  } catch (e) {
    applyServerErrors(e, setErrors, FIELDS)
  }
})
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader :title="isEdit ? 'Ubah Pegawai' : 'Tambah Pegawai'" :back="isEdit ? `/pegawai/${id}` : '/pegawai'" />
    <DetailSkeleton v-if="loadingData" />
    <ErrorState v-else-if="loadError" :error="loadError" back-to="/pegawai" @retry="load" />
    <form v-else class="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" novalidate @submit="onSubmit">
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <BaseInput v-model="nama" label="Nama Lengkap" placeholder="mis. Budi Santoso, S.T." :error="errors.nama" :maxlength="150" required />
        </div>
        <BaseInput
          :model-value="nip"
          label="NIP"
          placeholder="18 digit angka"
          inputmode="numeric"
          :maxlength="18"
          :error="errors.nip"
          :hint="`${String(nip ?? '').length}/18 digit`"
          required
          @update:model-value="onNipInput"
        />
        <BaseSelect v-model="golongan" label="Golongan" :options="golonganOptions" placeholder="Pilih golongan" :error="errors.golongan" required />
        <div class="sm:col-span-2">
          <BaseInput v-model="jabatan" label="Jabatan" placeholder="mis. Kepala Seksi Pemeliharaan" :error="errors.jabatan" :maxlength="150" required />
        </div>
        <div class="sm:col-span-2">
          <BaseSelect
            v-model="perangkatDaerahId"
            label="Perangkat Daerah"
            :options="pdOptions"
            placeholder="Pilih perangkat daerah"
            :error="errors.perangkat_daerah_id"
            :hint="isEdit && jumlahKendaraan > 0 ? `Pegawai ini penanggung jawab ${jumlahKendaraan} kendaraan; pindah perangkat daerah akan ditolak sampai penanggung jawab kendaraan diganti.` : undefined"
            required
          />
        </div>
      </div>
      <div class="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <BaseButton variant="secondary" :to="isEdit ? `/pegawai/${id}` : '/pegawai'">Batal</BaseButton>
        <BaseButton type="submit" :loading="isSubmitting">Simpan</BaseButton>
      </div>
    </form>
  </div>
</template>
