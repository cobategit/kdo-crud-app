import { readonly, ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

const toasts = ref<Toast[]>([])
let nextId = 1

function remove(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function push(type: ToastType, title: string, message?: string, duration = 4000) {
  const id = nextId++
  toasts.value.push({ id, type, title, message })
  if (duration > 0) setTimeout(() => remove(id), duration)
  return id
}

/** Toast global (state modul tunggal) agar bisa dipanggil dari komponen mana pun. */
export function useToast() {
  return {
    toasts: readonly(toasts),
    success: (title: string, message?: string) => push('success', title, message),
    error: (title: string, message?: string) => push('error', title, message, 6000),
    info: (title: string, message?: string) => push('info', title, message),
    remove,
  }
}
