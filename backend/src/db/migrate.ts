import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { closeDb, db } from './client'

const migrationsFolder = new URL('./migrations', import.meta.url).pathname

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder })
}

if (import.meta.main) {
  try {
    await runMigrations()
    console.log('✔ Migrasi selesai')
  } catch (error) {
    console.error('✘ Migrasi gagal:', error)
    process.exitCode = 1
  } finally {
    await closeDb()
  }
}
