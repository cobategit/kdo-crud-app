import { toApiError } from '@/api/http'
import { useToast } from '@/composables/useToast'

/**
 * Tampilkan error dari backend: pesan per field dipasang ke form (VeeValidate `setErrors`),
 * pesan umum ditampilkan sebagai toast.
 */
export function applyServerErrors(
  error: unknown,
  setErrors: (errors: Record<string, string>) => void,
  fields: readonly string[],
  title = 'Gagal menyimpan',
) {
  const err = toApiError(error)
  const known = Object.fromEntries(
    Object.entries(err.fieldErrors).filter(([field]) => fields.includes(field)),
  )
  if (Object.keys(known).length) setErrors(known)
  const firstFieldMessage = Object.values(known)[0]
  useToast().error(
    title,
    firstFieldMessage && err.code === 'VALIDASI_GAGAL'
      ? 'Periksa kembali isian yang ditandai.'
      : err.message,
  )
  return err
}
