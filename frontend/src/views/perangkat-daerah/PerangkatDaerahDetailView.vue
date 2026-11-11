<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Paginated } from '@/api/crud'
import type { ApiError } from '@/api/http'
import KondisiBadge from '@/components/kendaraan/KondisiBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DetailSkeleton from '@/components/ui/DetailSkeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useConfirmDelete } from '@/composables/useConfirmDelete'
import { useKendaraanStore } from '@/stores/kendaraan'
import { usePegawaiStore } from '@/stores/pegawai'
import { usePerangkatDaerahStore } from '@/stores/perangkatDaerah'
import type { Kendaraan, KondisiKendaraan, Pegawai, PerangkatDaerahDetail } from '@/types/models'
import { formatAngka, formatTanggalWaktu } from '@/utils/format'
import { KONDISI_LABEL, KONDISI_STYLE } from '@/utils/kondisi'

const props = defineProps<{ id: string }>()
const PREVIEW = 10

const store = usePerangkatDaerahStore()
const pegawaiStore = usePegawaiStore()
const kendaraanStore = useKendaraanStore()
const router = useRouter()

const pd = shallowRef<PerangkatDaerahDetail | null>(null)
const pegawai = shallowRef<Paginated<Pegawai> | null>(null)
const kendaraan = shallowRef<Paginated<Kendaraan> | null>(null)
const error = shallowRef<ApiError | null>(null)

async function load() {
  error.value = null
  pd.value = null
  try {
    const [detail, p, k] = await Promise.all([
      store.fetchById(props.id),
      pegawaiStore.query({ perangkat_daerah_id: props.id, per_page: PREVIEW, sort: 'nama' }),
      kendaraanStore.query({ perangkat_daerah_id: props.id, per_page: PREVIEW, sort: 'nomor_polisi' }),
    ])
    pd.value = detail
    pegawai.value = p
    kendaraan.value = k
  } catch (e) {
    error.value = e as ApiError
  }
}
watch(() => props.id, load, { immediate: true })

const kondisiList: KondisiKendaraan[] = ['baik', 'rusak_ringan', 'rusak_berat']

const del = useConfirmDelete<PerangkatDaerahDetail>({
  remove: (item) => store.remove(item.id),
  successMessage: (item) => `Perangkat daerah “${item.nama}” telah dihapus.`,
  onSuccess: () => router.push('/perangkat-daerah'),
})
</script>

<template>
  <div>
    <DetailSkeleton v-if="!pd && !error" />
    <ErrorState v-else-if="error" :error="error" back-to="/perangkat-daerah" back-label="Ke daftar" @retry="load" />
    <template v-else-if="pd">
      <PageHeader :title="pd.nama" back="/perangkat-daerah" back-label="Daftar perangkat daerah">
        <template #actions>
          <BaseButton variant="secondary" icon="edit" :to="`/perangkat-daerah/${pd.id}/ubah`">Ubah</BaseButton>
          <BaseButton variant="danger" icon="trash" @click="del.ask(pd)">Hapus</BaseButton>
        </template>
      </PageHeader>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          :to="{ path: '/pegawai', query: { perangkat_daerah_id: pd.id } }"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Pegawai</p>
          <p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{{ formatAngka(pd.jumlah_pegawai) }}</p>
        </RouterLink>
        <RouterLink
          :to="{ path: '/kendaraan', query: { perangkat_daerah_id: pd.id } }"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Kendaraan</p>
          <p class="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{{ formatAngka(pd.jumlah_kendaraan) }}</p>
        </RouterLink>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Kondisi kendaraan</p>
          <div class="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <RouterLink
              v-for="k in kondisiList"
              :key="k"
              :to="{ path: '/kendaraan', query: { perangkat_daerah_id: pd.id, kondisi: k } }"
              class="inline-flex items-center gap-2 hover:underline"
            >
              <span class="h-2 w-2 rounded-full" :class="KONDISI_STYLE[k].dot" aria-hidden="true" />
              <span class="text-slate-600">{{ KONDISI_LABEL[k] }}</span>
              <strong class="tabular-nums text-slate-900">{{ pd.rekap_kondisi[k] }}</strong>
            </RouterLink>
            <RouterLink
              :to="{ path: '/kendaraan', query: { perangkat_daerah_id: pd.id, tanpa_penanggung_jawab: 'true' } }"
              class="inline-flex items-center gap-2 hover:underline"
            >
              <span class="text-slate-600">Tanpa penanggung jawab</span>
              <strong class="tabular-nums text-slate-900">{{ pd.rekap_kondisi.tanpa_penanggung_jawab }}</strong>
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-2">
        <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header class="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 class="text-sm font-semibold text-slate-900">Pegawai</h3>
            <RouterLink
              v-if="(pegawai?.meta.total ?? 0) > 0"
              :to="{ path: '/pegawai', query: { perangkat_daerah_id: pd.id } }"
              class="text-sm font-medium text-brand-700 hover:underline"
            >
              Lihat semua ({{ pegawai?.meta.total }})
            </RouterLink>
          </header>
          <ul v-if="pegawai?.items.length" class="divide-y divide-slate-100">
            <li v-for="p in pegawai.items" :key="p.id" class="flex items-center justify-between gap-3 px-5 py-3">
              <div class="min-w-0">
                <RouterLink :to="`/pegawai/${p.id}`" class="block truncate text-sm font-medium text-slate-900 hover:text-brand-700">
                  {{ p.nama }}
                </RouterLink>
                <p class="truncate text-xs text-slate-500">NIP {{ p.nip }} · {{ p.jabatan }}</p>
              </div>
              <span class="shrink-0 text-xs text-slate-500">{{ p.golongan }}</span>
            </li>
          </ul>
          <EmptyState v-else icon="users" title="Belum ada pegawai" description="Pegawai yang bertugas di perangkat daerah ini akan tampil di sini." />
        </section>

        <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header class="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 class="text-sm font-semibold text-slate-900">Kendaraan Dinas</h3>
            <RouterLink
              v-if="(kendaraan?.meta.total ?? 0) > 0"
              :to="{ path: '/kendaraan', query: { perangkat_daerah_id: pd.id } }"
              class="text-sm font-medium text-brand-700 hover:underline"
            >
              Lihat semua ({{ kendaraan?.meta.total }})
            </RouterLink>
          </header>
          <ul v-if="kendaraan?.items.length" class="divide-y divide-slate-100">
            <li v-for="k in kendaraan.items" :key="k.id" class="flex items-center justify-between gap-3 px-5 py-3">
              <div class="min-w-0">
                <RouterLink :to="`/kendaraan/${k.id}`" class="block text-sm font-medium text-slate-900 hover:text-brand-700">
                  {{ k.nomor_polisi }}
                </RouterLink>
                <p class="truncate text-xs text-slate-500">
                  {{ k.merek }} {{ k.tipe_model }} · {{ k.penanggung_jawab?.nama ?? 'Tanpa penanggung jawab' }}
                </p>
              </div>
              <KondisiBadge :kondisi="k.kondisi" />
            </li>
          </ul>
          <EmptyState v-else icon="car" title="Belum ada kendaraan" />
        </section>
      </div>

      <p class="mt-6 text-xs text-slate-500">
        Dibuat {{ formatTanggalWaktu(pd.created_at) }} WIB · Diperbarui {{ formatTanggalWaktu(pd.updated_at) }} WIB
      </p>

      <ConfirmDialog
        :open="del.open.value"
        :loading="del.loading.value"
        :error="del.error.value"
        :message="`Hapus perangkat daerah “${pd.nama}”? Tindakan ini tidak dapat dibatalkan.`"
        @confirm="del.confirm"
        @cancel="del.cancel"
      />
    </template>
  </div>
</template>
