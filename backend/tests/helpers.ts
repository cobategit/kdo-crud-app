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
