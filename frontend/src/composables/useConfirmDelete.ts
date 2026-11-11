import { ref, shallowRef } from 'vue'
import { toApiError } from '@/api/http'
import { useToast } from './useToast'

/**
 * State dialog konfirmasi hapus. Bila server menolak (mis. RELASI_MASIH_DIGUNAKAN),
 * dialog tetap terbuka dan menampilkan pesan dari server.
 */
export function useConfirmDelete<T>(options: {
  remove: (target: T) => Promise<void>
  successMessage: (target: T) => string
  onSuccess?: (target: T) => unknown
}) {
  const toast = useToast()
  const target = shallowRef<T | null>(null)
  const open = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function ask(item: T) {
    target.value = item
    error.value = null
    open.value = true
  }

  function cancel() {
    if (loading.value) return
    open.value = false
  }

  async function confirm() {
    if (!target.value) return
    const item = target.value
    loading.value = true
    error.value = null
    try {
      await options.remove(item)
      open.value = false
      toast.success('Data dihapus', options.successMessage(item))
      await options.onSuccess?.(item)
    } catch (e) {
      error.value = toApiError(e).message
    } finally {
      loading.value = false
    }
  }

  return { target, open, loading, error, ask, cancel, confirm }
}
