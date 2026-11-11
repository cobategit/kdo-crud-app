<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { healthApi } from '@/api/health'
import { type ApiError, toApiError } from '@/api/http'
import type { HealthStatus } from '@/types/api'
import { formatTanggalWaktu } from '@/utils/format'

const health = ref<HealthStatus | null>(null)
const error = ref<ApiError | null>(null)
const loading = ref(true)

async function check() {
  loading.value = true
  error.value = null
  try {
    health.value = await healthApi.check()
  } catch (e) {
    error.value = toApiError(e)
  } finally {
    loading.value = false
  }
}

onMounted(check)
</script>

<template>
  <section class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-slate-900">Selamat datang di SIM-KDO</h2>
      <p class="mt-1 text-sm text-slate-600">
        Sistem pendataan kendaraan dinas operasional: kondisi kendaraan, perangkat daerah pemilik,
        dan pegawai penanggung jawab.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-sm font-semibold text-slate-900">Status Layanan</h3>
        <button
          type="button"
          class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          :disabled="loading"
          @click="check"
        >
          Periksa ulang
        </button>
      </div>

      <div v-if="loading" class="mt-4 space-y-2" aria-busy="true">
        <div class="h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-64 animate-pulse rounded bg-slate-200" />
      </div>
      <dl v-else-if="health" class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-slate-500">API &amp; Database</dt>
          <dd class="mt-1 inline-flex items-center gap-2 font-medium text-emerald-700">
            <span class="h-2 w-2 rounded-full bg-emerald-500" /> Terhubung
          </dd>
        </div>
        <div>
          <dt class="text-slate-500">Latensi DB</dt>
          <dd class="mt-1 font-medium text-slate-900">{{ health.latency_ms }} ms</dd>
        </div>
        <div>
          <dt class="text-slate-500">Waktu server</dt>
          <dd class="mt-1 font-medium text-slate-900">{{ formatTanggalWaktu(health.waktu) }} WIB</dd>
        </div>
      </dl>
      <p v-else-if="error" class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-700">
        <span class="h-2 w-2 rounded-full bg-red-500" /> {{ error.message }}
      </p>
    </div>
  </section>
</template>
