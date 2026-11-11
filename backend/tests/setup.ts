/**
 * Preload `bun test`: arahkan koneksi ke database test terpisah lalu jalankan migrasi.
 * Database test TIDAK PERNAH sama dengan database pengembangan.
 */
import { afterAll } from 'bun:test'

const testUrl = process.env.TEST_DATABASE_URL ?? 'postgres://kdo:kdo_secret@localhost:5432/kdo_test'

process.env.DATABASE_URL = testUrl
process.env.NODE_ENV = 'test'
process.env.CORS_ORIGIN ??= 'http://localhost:5173'

if (!/test/i.test(new URL(testUrl).pathname)) {
  throw new Error(`Menolak menjalankan test: nama database "${testUrl}" harus mengandung "test"`)
}

const { runMigrations } = await import('../src/db/migrate')
const { closeDb } = await import('../src/db/client')

await runMigrations()

afterAll(async () => {
  await closeDb()
})
