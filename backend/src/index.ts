import { createApp } from './app'
import { env } from './config/env'
import { closeDb } from './db/client'

const app = createApp().listen(env.PORT)

console.log(`🚗 KDO API berjalan di http://${app.server?.hostname}:${app.server?.port}`)
console.log(`📚 Dokumentasi OpenAPI: http://localhost:${env.PORT}/docs`)

async function shutdown(signal: string) {
  console.log(`\n${signal} diterima, menutup server...`)
  await app.stop()
  await closeDb()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

export type { App } from './app'
