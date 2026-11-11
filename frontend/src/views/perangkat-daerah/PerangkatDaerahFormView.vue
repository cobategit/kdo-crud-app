<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiError } from '@/api/http'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import DetailSkeleton from '@/components/ui/DetailSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useToast } from '@/composables/useToast'
import { perangkatDaerahSchema } from '@/schemas/perangkatDaerah'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import { applyServerErrors } from '@/utils/formErrors'

const props = defineProps<{ id?: string }>()
const isEdit = computed(() => Boolean(props.id))

const store = usePerangkatDaerahStore()
const router = useRouter()
const toast = useToast()
const loadError = ref<ApiError | null>(null)
const loadingData = ref(false)

const { defineField, errors, handleSubmit, setErrors, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(perangkatDaerahSchema),
  initialValues: { nama: '' },
})
const [nama] = defineField('nama')

async function load() {
  if (!props.id) return
  loadingData.value = true
  loadError.value = null
  try {
    const pd = await store.fetchById(props.id)
    resetForm({ values: { nama: pd.nama } })
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
    toast.success(
      props.id ? 'Perubahan disimpan' : 'Perangkat daerah ditambahkan',
      `“${saved.nama}” berhasil disimpan.`,
    )
    await router.push(`/perangkat-daerah/${saved.id}`)
  } catch (e) {
    applyServerErrors(e, setErrors, ['nama'])
  }
})
</script>

<template>
  <div class="max-w-2xl">
    <PageHeader
      :title="isEdit ? 'Ubah Perangkat Daerah' : 'Tambah Perangkat Daerah'"
      :back="isEdit ? `/perangkat-daerah/${id}` : '/perangkat-daerah'"
    />
    <DetailSkeleton v-if="loadingData" />
    <ErrorState v-else-if="loadError" :error="loadError" back-to="/perangkat-daerah" @retry="load" />
    <form
      v-else
      class="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      novalidate
      @submit="onSubmit"
    >
      <BaseInput
        v-model="nama"
        label="Nama Perangkat Daerah"
        placeholder="mis. Dinas Perhubungan"
        :error="errors.nama"
        :maxlength="150"
        required
      />
      <div class="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <BaseButton variant="secondary" :to="isEdit ? `/perangkat-daerah/${id}` : '/perangkat-daerah'">
          Batal
        </BaseButton>
        <BaseButton type="submit" :loading="isSubmitting">Simpan</BaseButton>
      </div>
    </form>
  </div>
</template>
