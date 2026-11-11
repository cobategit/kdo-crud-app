import { sql } from 'drizzle-orm'
import { createApp } from '../src/app'
import { db } from '../src/db/client'

export const app = createApp()

/** Kosongkan seluruh tabel domain di database test. */
export async function resetDb(): Promise<void> {
  await db.execute(
    sql`TRUNCATE kendaraan_dinas, pegawai, perangkat_daerah RESTART IDENTITY CASCADE`,
  )
}

export interface JsonResponse<T = unknown> {
  status: number
  body: T
}

/** Kirim request ke aplikasi tanpa membuka port (app.handle). */
export async function request<T = any>(
  method: string,
  path: string,
  body?: unknown,
): Promise<JsonResponse<T>> {
  const res = await app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  )
  const text = await res.text()
  return { status: res.status, body: (text ? JSON.parse(text) : null) as T }
}

let seq = 0
const next = () => ++seq

/** NIP unik 18 digit untuk test. */
export function nipUnik(): string {
  return `19850101201001${String(1000 + next()).padStart(4, '0')}`.slice(0, 18)
}

export async function buatPerangkatDaerah(nama = `Dinas Uji ${next()}`) {
  const res = await request('POST', '/api/v1/perangkat-daerah', { nama })
  if (res.status !== 201) throw new Error(`gagal membuat PD: ${JSON.stringify(res.body)}`)
  return res.body.data as { id: string; nama: string }
}

export async function buatPegawai(perangkat_daerah_id: string, data: Record<string, unknown> = {}) {
  const res = await request('POST', '/api/v1/pegawai', {
    nama: `Pegawai ${next()}`,
    nip: nipUnik(),
    jabatan: 'Staf',
    golongan: 'III/a',
    perangkat_daerah_id,
    ...data,
  })
  if (res.status !== 201) throw new Error(`gagal membuat pegawai: ${JSON.stringify(res.body)}`)
  return res.body.data as { id: string; nama: string; nip: string; perangkat_daerah_id: string }
}

export function kendaraanPayload(perangkat_daerah_id: string, data: Record<string, unknown> = {}) {
  const n = next()
  return {
    nomor_polisi: `B ${1000 + n} UJI`,
    merek: 'Toyota',
    tipe_model: 'Avanza 1.3 G',
    tahun_produksi: 2020,
    warna: 'Hitam',
    kondisi: 'baik',
    perangkat_daerah_id,
    pegawai_id: null,
    ...data,
  }
}

export async function buatKendaraan(
  perangkat_daerah_id: string,
  data: Record<string, unknown> = {},
) {
  const res = await request(
    'POST',
    '/api/v1/kendaraan',
    kendaraanPayload(perangkat_daerah_id, data),
  )
  if (res.status !== 201) throw new Error(`gagal membuat kendaraan: ${JSON.stringify(res.body)}`)
  return res.body.data as { id: string; nomor_polisi: string; pegawai_id: string | null }
}
