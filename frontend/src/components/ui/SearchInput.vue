<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{ placeholder?: string; label?: string }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="relative">
    <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder ?? 'Cari...'"
      :aria-label="label ?? placeholder ?? 'Cari'"
      class="block w-full rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600"
    />
  </div>
</template>
