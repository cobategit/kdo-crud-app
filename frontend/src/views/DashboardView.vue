<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppIcon, { type IconName } from '@/components/ui/AppIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useDashboardStore } from '@/stores/dashboard'
import type { KondisiKendaraan, RekapKondisiTotal } from '@/types/models'
import { formatAngka } from '@/utils/format'
import { KONDISI_LABEL, KONDISI_STYLE } from '@/utils/kondisi'

const store = useDashboardStore()
onMounted(() => void store.fetch())

const KONDISI: KondisiKendaraan[] = ['baik', 'rusak_ringan', 'rusak_berat']

interface Card {
  label: string
  value: number
  to: string | { path: string; query: Record<string, string> }
  icon?: IconName
  dot?: string
  note?: string
}

const cards = computed<Card[]>(() => {
  const d = store.data
  if (!d) return []
  const k = d.kendaraan
  const pct = (n: number) => (k.total ? `${Math.round((n / k.total) * 100)}% dari total` : undefined)
  return [
    { label: 'Total Kendaraan', value: k.total, to: '/kendaraan', icon: 'car' },
    ...KONDISI.map((kondisi) => ({
      label: KONDISI_LABEL[kondisi],
      value: k[kondisi],
      to: { path: '/kendaraan', query: { kondisi } },
      dot: KONDISI_STYLE[kondisi].dot,
      note: pct(k[kondisi]),
    })),
    {
      label: 'Tanpa Penanggung Jawab',
      value: k.tanpa_penanggung_jawab,
      to: { path: '/kendaraan', query: { tanpa_penanggung_jawab: 'true' } },
      icon: 'alert',
      note: pct(k.tanpa_penanggung_jawab),
    },
    { label: 'Total Pegawai', value: d.total_pegawai, to: '/pegawai', icon: 'users' },
    { label: 'Perangkat Daerah', value: d.total_perangkat_daerah, to: '/perangkat-daerah', icon: 'building' },
  ]
})

function barSegments(row: RekapKondisiTotal) {
  return KONDISI.filter((k) => row[k] > 0).map((k) => ({
    kondisi: k,
    width: `${(row[k] / row.total) * 100}%`,
    title: `${KONDISI_LABEL[k]}: ${row[k]} dari ${row.total} kendaraan`,
  }))
}

const kendaraanLink = (pdId: string, extra: Record<string, string> = {}) => ({
  path: '/kendaraan',
  query: { perangkat_daerah_id: pdId, ...extra },
})
</script>

<template>
  <div>
    <PageHeader title="Dashboard" description="Ringkasan kondisi kendaraan dinas operasional seluruh perangkat daerah." />

    <div v-if="store.error && !store.data" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      {{ store.error.message }}
      <button type="button" class="ml-2 font-medium underline" @click="store.fetch()">Coba lagi</button>
    </div>

    <!-- Kartu ringkasan -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" :aria-busy="store.loading">
      <template v-if="!store.data && store.loading">
        <div v-for="i in 7" :key="i" class="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-white" />
      </template>
      <RouterLink
        v-for="card in cards"
        v-else
        :key="card.label"
        :to="card.to"
        class="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow"
        :class="card.label === 'Total Kendaraan' ? 'col-span-2 lg:col-span-1' : ''"
      >
        <div class="flex items-start gap-2 text-sm leading-5 text-slate-600">
          <span v-if="card.dot" class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="card.dot" aria-hidden="true" />
          <AppIcon v-else-if="card.icon" :name="card.icon" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          {{ card.label }}
        </div>
        <p class="mt-2 text-3xl font-semibold tabular-nums text-slate-900 group-hover:text-brand-700">
          {{ formatAngka(card.value) }}
        </p>
        <p class="mt-0.5 h-4 text-xs text-slate-500">{{ card.note }}</p>
      </RouterLink>
    </div>

    <!-- Rekap kondisi per perangkat daerah -->
    <section class="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Kondisi Kendaraan per Perangkat Daerah</h3>
          <p class="text-xs text-slate-500">Klik angka untuk membuka daftar kendaraan dengan filter terkait.</p>
        </div>
        <ul class="flex flex-wrap gap-4 text-xs text-slate-600" aria-label="Legenda kondisi">
          <li v-for="k in KONDISI" :key="k" class="inline-flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-sm" :class="KONDISI_STYLE[k].bar" aria-hidden="true" />{{ KONDISI_LABEL[k] }}
          </li>
        </ul>
      </header>

      <div v-if="!store.data && store.loading" class="space-y-3 p-5">
        <div v-for="i in 3" :key="i" class="h-6 animate-pulse rounded bg-slate-100" />
      </div>
      <EmptyState
        v-else-if="store.data && store.data.per_perangkat_daerah.length === 0"
        icon="building"
        title="Belum ada perangkat daerah"
        description="Tambahkan perangkat daerah dan kendaraan untuk melihat rekap."
      />
      <div v-else-if="store.data" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" class="px-5 py-3 text-left">Perangkat Daerah</th>
              <th scope="col" class="hidden w-1/4 px-5 py-3 text-left md:table-cell">Proporsi</th>
              <th scope="col" class="px-3 py-3 text-right">Total</th>
              <th v-for="k in KONDISI" :key="k" scope="col" class="px-3 py-3 text-right">{{ KONDISI_LABEL[k] }}</th>
              <th scope="col" class="px-5 py-3 text-right">Tanpa PJ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in store.data.per_perangkat_daerah" :key="row.perangkat_daerah.id" class="hover:bg-slate-50">
              <th scope="row" class="px-5 py-3 text-left font-medium text-slate-900">
                <RouterLink :to="`/perangkat-daerah/${row.perangkat_daerah.id}`" class="hover:text-brand-700">
                  {{ row.perangkat_daerah.nama }}
                </RouterLink>
              </th>
              <td class="hidden px-5 py-3 md:table-cell">
                <div v-if="row.total" class="flex h-2.5 gap-0.5 overflow-hidden rounded-full" role="img" :aria-label="barSegments(row).map((s) => s.title).join('; ')">
                  <span
                    v-for="seg in barSegments(row)"
                    :key="seg.kondisi"
                    class="h-full first:rounded-l-full last:rounded-r-full"
                    :class="KONDISI_STYLE[seg.kondisi].bar"
                    :style="{ width: seg.width }"
                    :title="seg.title"
                  />
                </div>
                <span v-else class="text-xs text-slate-400">Belum ada kendaraan</span>
              </td>
              <td class="px-3 py-3 text-right font-semibold tabular-nums">
                <RouterLink :to="kendaraanLink(row.perangkat_daerah.id)" class="hover:text-brand-700 hover:underline">{{ row.total }}</RouterLink>
              </td>
              <td v-for="k in KONDISI" :key="k" class="px-3 py-3 text-right tabular-nums">
                <RouterLink
                  v-if="row[k] > 0"
                  :to="kendaraanLink(row.perangkat_daerah.id, { kondisi: k })"
                  class="hover:text-brand-700 hover:underline"
                >
                  {{ row[k] }}
                </RouterLink>
                <span v-else class="text-slate-300">0</span>
              </td>
              <td class="px-5 py-3 text-right tabular-nums">
                <RouterLink
                  v-if="row.tanpa_penanggung_jawab > 0"
                  :to="kendaraanLink(row.perangkat_daerah.id, { tanpa_penanggung_jawab: 'true' })"
                  class="hover:text-brand-700 hover:underline"
                >
                  {{ row.tanpa_penanggung_jawab }}
                </RouterLink>
                <span v-else class="text-slate-300">0</span>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 font-semibold text-slate-900">
            <tr>
              <th scope="row" class="px-5 py-3 text-left">Jumlah</th>
              <td class="hidden md:table-cell" />
              <td class="px-3 py-3 text-right tabular-nums">{{ store.data.kendaraan.total }}</td>
              <td v-for="k in KONDISI" :key="k" class="px-3 py-3 text-right tabular-nums">{{ store.data.kendaraan[k] }}</td>
              <td class="px-5 py-3 text-right tabular-nums">{{ store.data.kendaraan.tanpa_penanggung_jawab }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>
