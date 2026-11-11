import { Elysia, type ValidationError as ElysiaValidationError } from 'elysia'
import { AppError, type ErrorDetail, mapDatabaseError } from './errors'
import { fail } from './response'

function validationDetails(error: Readonly<ElysiaValidationError>): ErrorDetail[] {
  const seen = new Set<string>()
  const details: ErrorDetail[] = []
  for (const issue of error.all) {
    const raw = 'path' in issue ? String(issue.path ?? '') : ''
    const field = raw.replace(/^\//, '').replace(/\//g, '.') || error.type
    if (seen.has(field)) continue
    seen.add(field)
    const message =
      ('schema' in issue && typeof issue.schema?.error === 'string' && issue.schema.error) ||
      ('message' in issue && issue.message) ||
      'Nilai tidak valid'
    details.push({ field, message: String(message) })
  }
  return details
}

/**
 * Penanganan error terpusat. Semua error diubah ke format
 * `{ success: false, error: { code, message, details? } }` tanpa membocorkan stack trace.
 */
export const errorHandler = new Elysia({ name: 'error-handler' })
  .error({ AppError })
  .onError({ as: 'global' }, ({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.status
      return fail(error.code, error.message, error.details)
    }

    switch (code) {
      case 'VALIDATION':
        set.status = 422
        return fail('VALIDASI_GAGAL', 'Data tidak valid', validationDetails(error))
      case 'PARSE':
        set.status = 422
        return fail('VALIDASI_GAGAL', 'Format body request tidak valid')
      case 'NOT_FOUND':
        set.status = 404
        return fail('TIDAK_DITEMUKAN', 'Endpoint tidak ditemukan')
    }

    const mapped = mapDatabaseError(error)
    if (mapped) {
      set.status = mapped.status
      return fail(mapped.code, mapped.message, mapped.details)
    }

    if (process.env.NODE_ENV !== 'test') console.error('[KESALAHAN_SERVER]', error)
    set.status = 500
    return fail('KESALAHAN_SERVER', 'Terjadi kesalahan pada server')
  })
