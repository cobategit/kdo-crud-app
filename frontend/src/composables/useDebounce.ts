import { onScopeDispose, type Ref, ref, watch } from 'vue'

/** Ref turunan yang baru berubah setelah `source` diam selama `delay` ms. */
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })
  onScopeDispose(() => clearTimeout(timer))
  return debounced
}

/** Bungkus fungsi agar baru dieksekusi setelah tidak dipanggil selama `delay` ms. */
export function useDebounceFn<A extends unknown[]>(fn: (...args: A) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined
  onScopeDispose(() => clearTimeout(timer))
  const debounced = (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
