<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string; size?: 'sm' | 'md' }>()
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
const titleId = useId()
let previousFocus: HTMLElement | null = null

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      panel.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      previousFocus?.focus?.()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
        <div class="absolute inset-0 bg-slate-900/50" aria-hidden="true" @click="emit('close')" />
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          class="relative w-full rounded-xl bg-white shadow-xl outline-none"
          :class="size === 'md' ? 'max-w-lg' : 'max-w-md'"
        >
          <div class="px-5 pt-5">
            <h3 :id="titleId" class="text-base font-semibold text-slate-900">{{ title }}</h3>
          </div>
          <div class="px-5 py-4"><slot /></div>
          <div v-if="$slots.footer" class="flex flex-col-reverse gap-2 rounded-b-xl bg-slate-50 px-5 py-3 sm:flex-row sm:justify-end">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
