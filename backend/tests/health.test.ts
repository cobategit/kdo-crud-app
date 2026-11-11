import { describe, expect, it } from 'bun:test'
import { request } from './helpers'

describe('GET /api/v1/health', () => {
  it('mengembalikan status ok beserta cek koneksi database', async () => {
    const res = await request<{ success: boolean; data: { database: string } }>(
      'GET',
      '/api/v1/health',
    )
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.database).toBe('ok')
  })

  it('mengembalikan 404 berformat standar untuk endpoint yang tidak ada', async () => {
    const res = await request<{ success: boolean; error: { code: string; message: string } }>(
      'GET',
      '/api/v1/tidak-ada',
    )
    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: { code: 'TIDAK_DITEMUKAN', message: 'Endpoint tidak ditemukan' },
    })
  })
})
