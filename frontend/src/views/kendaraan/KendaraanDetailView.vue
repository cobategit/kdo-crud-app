<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiError } from '@/api/http'
import KondisiQuickSelect from '@/components/kendaraan/KondisiQuickSelect.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DetailSkeleton from '@/components/ui/DetailSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import InfoList from '@/components/ui/InfoList.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import { useKendaraanStore } from '@/stores/kendaraan'
import type { Kendaraan } from '@/types/models'
import { formatTanggalWaktu } from '@/utils/format'

const props = defineProps<{ id: string }>()
const store = useKendaraanStore()
const router = useRouter()
const error = shallowRef<ApiError | null>(null)

// Data dibaca dari store agar perubahan kondisi (PATCH) langsung tercermin.
const kendaraan = computed<Kendaraan | null>(() =>
  store.current?.id === props.id ? store.current : null,
)

async function load() {
  error.value = null
  try {
    await store.fetchById(props.id)
  } catch (e) {
    error.value = e as ApiError
  }
}
onMounted(load)
watch(() => props.id, load)

const del = useConfirmDelete<Kendaraan>({
  remove: (k) => store.remove(k.id),
  successMessage: (k) => `Kendaraan ${k.nomor_polisi} telah dihapus.`,
  onSuccess: () => router.push('/kendaraan'),
})
</script>

<template>
  <div>
    <ErrorState v-if="error" :error="error" back-to="/kendaraan" back-label="Ke daftar" @retry="load" />
    <DetailSkeleton v-else-if="!kendaraan" />
    <template v-else>
      <PageHeader :title="kendaraan.nomor_polisi" :description="`${kendaraan.merek} ${kendaraan.tipe_model}`" back="/kendaraan" back-label="Daftar kendaraan">
        <template #actions>
          <BaseButton variant="secondary" icon="edit" :to="`/kendaraan/${kendaraan.id}/ubah`">Ubah</BaseButton>
          <BaseButton variant="danger" icon="trash" @click="del.ask(kendaraan)">Hapus</BaseButton>
        </template>
      </PageHeader>

      <div class="grid gap-6 xl:grid-cols-3">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-sm font-semibold text-slate-900">Data Kendaraan</h3>
            <div class="flex items-center gap-2 text-sm text-slate-600">
              Kondisi: <KondisiQuickSelect :kendaraan="kendaraan" />
            </div>
          </div>
          <InfoList
            :items="[
              { label: 'Nomor Polisi', value: kendaraan.nomor_polisi },
              { label: 'Merek', value: kendaraan.merek },
              { label: 'Tipe / Model', value: kendaraan.tipe_model },
              { label: 'Tahun Produksi', value: kendaraan.tahun_produksi },
              { label: 'Warna', value: kendaraan.warna },
              { label: 'Perangkat Daerah', slot: 'pd' },
              { label: 'Keterangan', value: kendaraan.keterangan },
              { label: 'Terakhir diperbarui', value: `${formatTanggalWaktu(kendaraan.updated_at)} WIB` },
            ]"
          >
            <template #pd>
              <RouterLink :to="`/perangkat-daerah/${kendaraan.perangkat_daerah.id}`" class="font-medium text-brand-700 hover:underline">
                {{ kendaraan.perangkat_daerah.nama }}
              </RouterLink>
            </template>
          </InfoList>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="mb-5 text-sm font-semibold text-slate-900">Penanggung Jawab</h3>
          <div v-if="kendaraan.penanggung_jawab" class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <AppIcon name="user" class="h-5 w-5" />
              </span>
              <div class="min-w-0">
                <RouterLink :to="`/pegawai/${kendaraan.penanggung_jawab.id}`" class="block truncate font-medium text-slate-900 hover:text-brand-700">
                  {{ kendaraan.penanggung_jawab.nama }}
                </RouterLink>
                <p class="truncate text-sm text-slate-500">{{ kendaraan.penanggung_jawab.jabatan }}</p>
              </div>
            </div>
            <dl class="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div>
                <dt class="text-xs uppercase tracking-wide text-slate-500">NIP</dt>
                <dd class="mt-0.5 font-mono text-xs text-slate-900">{{ kendaraan.penanggung_jawab.nip }}</dd>
              </div>
              <div>
                <dt class="text-xs uppercase tracking-wide text-slate-500">Golongan</dt>
                <dd class="mt-0.5 text-slate-900">{{ kendaraan.penanggung_jawab.golongan }}</dd>
              </div>
            </dl>
          </div>
          <div v-else class="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Kendaraan ini belum memiliki penanggung jawab.
            <RouterLink :to="`/kendaraan/${kendaraan.id}/ubah`" class="mt-2 block font-medium underline">Tetapkan penanggung jawab</RouterLink>
          </div>
        </section>
      </div>

      <ConfirmDialog
        :open="del.open.value"
        :loading="del.loading.value"
        :error="del.error.value"
        :message="`Hapus kendaraan ${kendaraan.nomor_polisi}? Tindakan ini tidak dapat dibatalkan.`"
        @confirm="del.confirm"
        @cancel="del.cancel"
      />
    </template>
  </div>
</template>
