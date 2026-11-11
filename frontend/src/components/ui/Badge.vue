<script setup lang="ts">
defineProps<{ tone?: 'neutral' | 'brand' | 'warning' }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
    :class="{
      'bg-slate-50 text-slate-700 ring-slate-500/20': !tone || tone === 'neutral',
      'bg-brand-50 text-brand-700 ring-brand-600/20': tone === 'brand',
      'bg-amber-50 text-amber-800 ring-amber-600/25': tone === 'warning',
    }"
  >
    <slot />
  </span>
</template>
