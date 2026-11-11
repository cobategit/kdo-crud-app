<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import AppIcon from './AppIcon.vue'

defineProps<{ title: string; description?: string; back?: RouteLocationRaw; backLabel?: string }>()
</script>

<template>
  <div class="mb-6">
    <RouterLink
      v-if="back"
      :to="back"
      class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
    >
      <AppIcon name="arrow-left" class="h-4 w-4" /> {{ backLabel ?? 'Kembali' }}
    </RouterLink>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold text-slate-900 sm:text-2xl">{{ title }}</h1>
        <p v-if="description" class="mt-1 text-sm text-slate-600">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
