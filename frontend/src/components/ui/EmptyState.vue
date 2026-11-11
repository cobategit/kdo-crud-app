<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue'

defineProps<{ title: string; description?: string; icon?: IconName }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <span class="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
      <AppIcon :name="icon ?? 'inbox'" class="h-6 w-6" />
    </span>
    <p class="mt-4 text-sm font-semibold text-slate-900">{{ title }}</p>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-slate-500">{{ description }}</p>
    <div v-if="$slots.default" class="mt-4"><slot /></div>
  </div>
</template>
