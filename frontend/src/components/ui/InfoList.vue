<script setup lang="ts">
export interface InfoItem {
  label: string
  value?: string | number | null
  /** Nama slot untuk isi kustom. */
  slot?: string
}
defineProps<{ items: InfoItem[] }>()
</script>

<template>
  <dl class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
    <div v-for="item in items" :key="item.label" class="min-w-0">
      <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ item.label }}</dt>
      <dd class="mt-1 break-words text-sm text-slate-900">
        <slot v-if="item.slot" :name="item.slot" />
        <template v-else>{{ item.value === null || item.value === undefined || item.value === '' ? '-' : item.value }}</template>
      </dd>
    </div>
  </dl>
</template>
