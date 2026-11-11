<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiError } from '@/api/http'
import PenanggungJawabSelect from '@/components/kendaraan/PenanggungJawabSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import DetailSkeleton from '@/components/ui/DetailSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useToast } from '@/composables/useToast'
import { kendaraanSchema } from '@/schemas/kendaraan'
import { useKendaraanStore } from '@/stores/kendaraan'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import { KONDISI_KENDARAAN, type PenanggungJawab } from '@/types/models'
import { applyServerErrors } from '@/utils/formErrors'
import { KONDISI_LABEL } from '@/utils/kondisi'
import { normalizeNomorPolisi, tahunBerjalan } from '@/utils/nomorPolisi'

const props = defineProps<{ id?: string }>()
const isEdit = computed(() => Boolean(props.id))
const FIELDS = [
  'nomor_polisi',
  'merek',
  'tipe_model',
  'tahun_produksi',
  'warna',
  'kondisi',
  'perangkat_daerah_id',
  'pegawai_id',
  'keterangan',
] as const

const store = useKendaraanStore()
const pdStore = usePerangkatDaerahStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const loadError = ref<ApiError | null>(null)
const loadingData = ref(false)
const initialPj = shallowRef<PenanggungJawab | null>(null)

const { defineField, errors, handleSubmit, setErrors, setFieldError, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(kendaraanSchema),
  initialValues: {
    nomor_polisi: '',
    merek: '',
    tipe_model: '',
    tahun_produksi: undefined,
    warna: '',
    kondisi: 'baik' as const,
    perangkat_daerah_id: typeof route.query.perangkat_daerah_id === 'string' ? route.query.perangkat_daerah_id : '',
    pegawai_id: null,
    keterangan: '',
  },
})
const [nomorPolisi] = defineField('nomor_polisi')
const [merek] = defineField('merek')
const [tipeModel] = defineField('tipe_model')
const [tahunProduksi] = defineField('tahun_produksi')
const [warna] = defineField('warna')
const [kondisi] = defineField('kondisi')
const [perangkatDaerahId] = defineField('perangkat_daerah_id')
const [pegawaiId] = defineField('pegawai_id')
const [keterangan] = defineField('keterangan')

const pdOptions = computed(() => pdStore.options.map((p) => ({ value: p.id, label: p.nama })))
const kondisiOptions = KONDISI_KENDARAAN.map((k) => ({ value: k, label: KONDISI_LABEL[k] }))

/** Nomor polisi otomatis huruf besar saat diketik, dinormalisasi spasinya saat keluar field. */
function onNopolInput(value: string | number | null | undefined) {
  nomorPolisi.value = String(value ?? '').toUpperCase()
}
function onNopolBlur() {
  if (nomorPolisi.value) nomorPolisi.value = normalizeNomorPolisi(nomorPolisi.value)
}

/** Ganti perangkat daerah → kosongkan penanggung jawab (harus dari PD yang sama). */
function onPerangkatDaerahChange(value: string | null | undefined) {
  if (value === perangkatDaerahId.value) return
  perangkatDaerahId.value = value ?? ''
  pegawaiId.value = null
  initialPj.value = null
  setFieldError('pegawai_id', undefined)
}

async function load() {
  loadError.value = null
  const pdPromise = pdStore.fetchOptions()
  if (!props.id) return void (await pdPromise)
  loadingData.value = true
  try {
    const [k] = await Promise.all([store.fetchById(props.id), pdPromise])
    initialPj.value = k.penanggung_jawab
    resetForm({
      values: {
        nomor_polisi: k.nomor_polisi,
        merek: k.merek,
        tipe_model: k.tipe_model,
        tahun_produksi: k.tahun_produksi,
        warna: k.warna,
        kondisi: k.kondisi,
        perangkat_daerah_id: k.perangkat_daerah_id,
        pegawai_id: k.pegawai_id,
        keterangan: k.keterangan ?? '',
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
  const payload = {
    ...values,
    pegawai_id: values.pegawai_id || null,
    keterangan: values.keterangan?.trim() ? values.keterangan.trim() : null,
  }
  try {
    const saved = props.id ? await store.update(props.id, payload) : await store.create(payload)
    toast.success(props.id ? 'Perubahan disimpan' : 'Kendaraan ditambahkan', `${saved.nomor_polisi} berhasil disimpan.`)
    await router.push(`/kendaraan/${saved.id}`)
  } catch (e) {
    applyServerErrors(e, setErrors, FIELDS)
  }
})
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader :title="isEdit ? 'Ubah Kendaraan' : 'Tambah Kendaraan'" :back="isEdit ? `/kendaraan/${id}` : '/kendaraan'" />
    <DetailSkeleton v-if="loadingData" />
    <ErrorState v-else-if="loadError" :error="loadError" back-to="/kendaraan" @retry="load" />
    <form v-else class="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" novalidate data-testid="kendaraan-form" @submit="onSubmit">
      <fieldset class="space-y-5">
        <legend class="mb-4 text-sm font-semibold text-slate-900">Identitas Kendaraan</legend>
        <div class="grid gap-5 sm:grid-cols-2">
          <BaseInput
            :model-value="nomorPolisi"
            label="Nomor Polisi"
            placeholder="B 1234 ABC"
            :error="errors.nomor_polisi"
            hint="Otomatis huruf besar, mis. B 1234 ABC"
            :maxlength="14"
            required
            data-testid="nopol"
            @update:model-value="onNopolInput"
            @blur="onNopolBlur"
          />
          <BaseInput v-model="tahunProduksi" type="number" label="Tahun Produksi" :placeholder="String(tahunBerjalan())" :error="errors.tahun_produksi" inputmode="numeric" required />
          <BaseInput v-model="merek" label="Merek" placeholder="mis. Toyota" :error="errors.merek" :maxlength="50" required />
          <BaseInput v-model="tipeModel" label="Tipe / Model" placeholder="mis. Innova Reborn 2.4 G" :error="errors.tipe_model" :maxlength="100" required />
          <BaseInput v-model="warna" label="Warna" placeholder="mis. Hitam" :error="errors.warna" :maxlength="30" required />
          <BaseSelect v-model="kondisi" label="Kondisi" :options="kondisiOptions" :error="errors.kondisi" required />
        </div>
      </fieldset>

      <fieldset class="space-y-5 border-t border-slate-100 pt-6">
        <legend class="sr-only">Kepemilikan & Penanggung Jawab</legend>
        <p class="text-sm font-semibold text-slate-900" aria-hidden="true">Kepemilikan &amp; Penanggung Jawab</p>
        <div class="grid gap-5 sm:grid-cols-2">
          <BaseSelect
            :model-value="perangkatDaerahId"
            label="Perangkat Daerah"
            :options="pdOptions"
            placeholder="Pilih perangkat daerah"
            :error="errors.perangkat_daerah_id"
            required
            data-testid="pd-select"
            @update:model-value="onPerangkatDaerahChange"
          />
          <PenanggungJawabSelect
            v-model="pegawaiId"
            :perangkat-daerah-id="perangkatDaerahId"
            :initial="initialPj"
            :error="errors.pegawai_id"
          />
        </div>
        <BaseTextarea v-model="keterangan" label="Keterangan" placeholder="Catatan tambahan (opsional)" :error="errors.keterangan" :maxlength="1000" />
      </fieldset>

      <div class="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <BaseButton variant="secondary" :to="isEdit ? `/kendaraan/${id}` : '/kendaraan'">Batal</BaseButton>
        <BaseButton type="submit" :loading="isSubmitting">Simpan</BaseButton>
      </div>
    </form>
  </div>
</template>
