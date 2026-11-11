import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from './http'

function axiosErrorWith(status: number, data: unknown) {
  const headers = new AxiosHeaders()
  return new AxiosError('fail', 'ERR', { headers }, null, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers },
  })
}

describe('toApiError', () => {
  it('menormalisasi error backend beserta detail per field', () => {
    const err = toApiError(
      axiosErrorWith(422, {
        success: false,
        error: {
          code: 'VALIDASI_GAGAL',
          message: 'Data tidak valid',
          details: [{ field: 'nip', message: 'NIP harus 18 digit angka' }],
        },
      }),
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(422)
    expect(err.code).toBe('VALIDASI_GAGAL')
    expect(err.fieldErrors).toEqual({ nip: 'NIP harus 18 digit angka' })
  })

  it('memberi kode JARINGAN bila server tidak merespons', () => {
    const err = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'))
    expect(err.code).toBe('JARINGAN')
  })
})
