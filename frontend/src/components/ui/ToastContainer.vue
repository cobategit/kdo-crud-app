<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import AppIcon from './AppIcon.vue'

const { toasts, remove } = useToast()

const styles = {
  success: { box: 'border-emerald-200', icon: 'text-emerald-600', name: 'check' },
  error: { box: 'border-red-200', icon: 'text-red-600', name: 'alert' },
  info: { box: 'border-brand-100', icon: 'text-brand-600', name: 'info' },
} as const
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    aria-live="polite"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="status"
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg"
        :class="styles[toast.type].box"
      >
        <AppIcon :name="styles[toast.type].name" :class="`mt-0.5 h-5 w-5 shrink-0 ${styles[toast.type].icon}`" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900">{{ toast.title }}</p>
          <p v-if="toast.message" class="mt-0.5 text-sm text-slate-600">{{ toast.message }}</p>
        </div>
        <button
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600"
          aria-label="Tutup notifikasi"
          @click="remove(toast.id)"
        >
          <AppIcon name="close" class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
