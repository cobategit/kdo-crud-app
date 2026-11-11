<script setup lang="ts">
import type { KondisiKendaraan } from '@/types/models'
import { KONDISI_LABEL, KONDISI_STYLE } from '@/utils/kondisi'

defineProps<{ kondisi: KondisiKendaraan }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
    :class="KONDISI_STYLE[kondisi].badge"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="KONDISI_STYLE[kondisi].dot" aria-hidden="true" />
    {{ KONDISI_LABEL[kondisi] }}
  </span>
</template>
