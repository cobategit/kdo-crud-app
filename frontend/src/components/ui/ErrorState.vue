<script setup lang="ts">
import type { ApiError } from '@/api/http'
import AppIcon from './AppIcon.vue'
import BaseButton from './BaseButton.vue'

defineProps<{ error: ApiError; backTo?: string; backLabel?: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
    <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
      <AppIcon name="alert" class="h-6 w-6" />
    </span>
    <p class="mt-4 text-sm font-semibold text-slate-900">
      {{ error.code === 'TIDAK_DITEMUKAN' ? 'Data tidak ditemukan' : 'Gagal memuat data' }}
    </p>
    <p class="mt-1 text-sm text-slate-500">{{ error.message }}</p>
    <div class="mt-5 flex justify-center gap-2">
      <BaseButton v-if="backTo" variant="secondary" :to="backTo">{{ backLabel ?? 'Kembali' }}</BaseButton>
      <BaseButton v-if="error.code !== 'TIDAK_DITEMUKAN'" @click="$emit('retry')">Coba lagi</BaseButton>
    </div>
  </div>
</template>
