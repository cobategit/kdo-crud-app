import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env'
import * as schema from './schema'

export const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'test' ? 5 : 10,
  onnotice: () => {},
  connection: { TimeZone: 'Asia/Jakarta' },
})

export const db = drizzle(queryClient, { schema, casing: 'snake_case' })

export type Database = typeof db
/** Tipe transaksi Drizzle, dipakai repository agar bisa berjalan di dalam/luar transaksi. */
export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0]
export type DbOrTx = Database | Tx

export async function closeDb(): Promise<void> {
  await queryClient.end({ timeout: 5 })
}
