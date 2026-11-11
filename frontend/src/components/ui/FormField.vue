<script setup lang="ts">
defineProps<{
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
}>()
</script>

<template>
  <div>
    <label v-if="label" :for="id" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }}<span v-if="required" class="text-red-600" aria-hidden="true"> *</span>
    </label>
    <slot />
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs text-red-600" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
