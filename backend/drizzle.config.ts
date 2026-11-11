import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://kdo:kdo_secret@localhost:5432/kdo',
  },
  casing: 'snake_case',
  strict: true,
  verbose: true,
})
