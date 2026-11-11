<script setup lang="ts">
// Tampilan sementara selama pengembangan bertahap; diganti oleh modul pada fase 1–3.
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <h2 class="text-lg font-semibold text-slate-900">{{ route.meta.title }}</h2>
    <p class="mt-2 text-sm text-slate-600">Modul ini sedang dalam tahap pengembangan.</p>
  </div>
</template>
