<template>
  <div class="space-y-4" aria-busy="true" aria-label="Memuat data">
    <div class="h-7 w-64 animate-pulse rounded bg-slate-200" />
    <div class="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
      <div v-for="i in 6" :key="i" class="space-y-2">
        <div class="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div class="h-4 w-48 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  </div>
</template>
