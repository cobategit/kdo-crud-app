<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiError } from '@/api/http'
import KondisiBadge from '@/components/kendaraan/KondisiBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DetailSkeleton from '@/components/ui/DetailSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import InfoList from '@/components/ui/InfoList.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import { usePegawaiStore } from '@/stores/pegawai'
import type { PegawaiDetail } from '@/types/models'
import { formatTanggalWaktu } from '@/utils/format'

const props = defineProps<{ id: string }>()
const store = usePegawaiStore()
const router = useRouter()
const pegawai = shallowRef<PegawaiDetail | null>(null)
const error = shallowRef<ApiError | null>(null)

async function load() {
  error.value = null
  pegawai.value = null
  try {
    pegawai.value = await store.fetchById(props.id)
  } catch (e) {
    error.value = e as ApiError
  }
}
watch(() => props.id, load, { immediate: true })

const del = useConfirmDelete<PegawaiDetail>({
  remove: (p) => store.remove(p.id),
  successMessage: (p) => `Pegawai “${p.nama}” telah dihapus.`,
  onSuccess: () => router.push('/pegawai'),
})
</script>

<template>
  <div>
    <DetailSkeleton v-if="!pegawai && !error" />
    <ErrorState v-else-if="error" :error="error" back-to="/pegawai" back-label="Ke daftar" @retry="load" />
    <template v-else-if="pegawai">
      <PageHeader :title="pegawai.nama" :description="pegawai.jabatan" back="/pegawai" back-label="Daftar pegawai">
        <template #actions>
          <BaseButton variant="secondary" icon="edit" :to="`/pegawai/${pegawai.id}/ubah`">Ubah</BaseButton>
          <BaseButton variant="danger" icon="trash" @click="del.ask(pegawai)">Hapus</BaseButton>
        </template>
      </PageHeader>

      <div class="grid gap-6 lg:grid-cols-5">
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 class="mb-5 text-sm font-semibold text-slate-900">Data Pegawai</h3>
          <InfoList
            :items="[
              { label: 'NIP', value: pegawai.nip },
              { label: 'Golongan', value: pegawai.golongan },
              { label: 'Jabatan', value: pegawai.jabatan },
              { label: 'Perangkat Daerah', slot: 'pd' },
              { label: 'Dibuat', value: `${formatTanggalWaktu(pegawai.created_at)} WIB` },
              { label: 'Diperbarui', value: `${formatTanggalWaktu(pegawai.updated_at)} WIB` },
            ]"
          >
            <template #pd>
              <RouterLink :to="`/perangkat-daerah/${pegawai.perangkat_daerah.id}`" class="font-medium text-brand-700 hover:underline">
                {{ pegawai.perangkat_daerah.nama }}
              </RouterLink>
            </template>
          </InfoList>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <header class="border-b border-slate-100 px-5 py-3">
            <h3 class="text-sm font-semibold text-slate-900">
              Kendaraan yang Menjadi Tanggung Jawab
              <span class="ml-1 font-normal text-slate-500">({{ pegawai.kendaraan.length }})</span>
            </h3>
          </header>
          <ul v-if="pegawai.kendaraan.length" class="divide-y divide-slate-100">
            <li v-for="k in pegawai.kendaraan" :key="k.id" class="flex items-center justify-between gap-3 px-5 py-3">
              <div class="min-w-0">
                <RouterLink :to="`/kendaraan/${k.id}`" class="text-sm font-medium text-slate-900 hover:text-brand-700">
                  {{ k.nomor_polisi }}
                </RouterLink>
                <p class="truncate text-xs text-slate-500">{{ k.merek }} {{ k.tipe_model }} · {{ k.tahun_produksi }}</p>
              </div>
              <KondisiBadge :kondisi="k.kondisi" />
            </li>
          </ul>
          <EmptyState v-else icon="car" title="Belum menjadi penanggung jawab kendaraan" />
        </section>
      </div>

      <ConfirmDialog
        :open="del.open.value"
        :loading="del.loading.value"
        :error="del.error.value"
        :message="`Hapus pegawai “${pegawai.nama}”? Tindakan ini tidak dapat dibatalkan.`"
        @confirm="del.confirm"
        @cancel="del.cancel"
      />
    </template>
  </div>
</template>
