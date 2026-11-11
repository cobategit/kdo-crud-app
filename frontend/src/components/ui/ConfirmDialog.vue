<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import BaseButton from './BaseButton.vue'
import Modal from './Modal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmLabel?: string
    loading?: boolean
    /** Pesan error dari server (mis. ditolak karena relasi); dialog tetap terbuka. */
    error?: string | null
  }>(),
  { title: 'Konfirmasi Hapus', confirmLabel: 'Hapus' },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Modal :open="open" :title="title" @close="!loading && emit('cancel')">
    <p class="text-sm text-slate-600">{{ message }}</p>
    <div
      v-if="error"
      class="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      <AppIcon name="alert" class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ error }}</span>
    </div>
    <template #footer>
      <BaseButton variant="secondary" :disabled="loading" @click="emit('cancel')">
        {{ error ? 'Tutup' : 'Batal' }}
      </BaseButton>
      <BaseButton v-if="!error" variant="danger" :loading="loading" @click="emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </Modal>
</template>
