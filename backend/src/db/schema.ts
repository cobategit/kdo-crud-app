import { relations, sql } from 'drizzle-orm'
import {
  char,
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const KONDISI_KENDARAAN = ['baik', 'rusak_ringan', 'rusak_berat'] as const
export type KondisiKendaraan = (typeof KONDISI_KENDARAAN)[number]

export const GOLONGAN = [
  'I/a',
  'I/b',
  'I/c',
  'I/d',
  'II/a',
  'II/b',
  'II/c',
  'II/d',
  'III/a',
  'III/b',
  'III/c',
  'III/d',
  'IV/a',
  'IV/b',
  'IV/c',
  'IV/d',
  'IV/e',
] as const
export type Golongan = (typeof GOLONGAN)[number]

export const kondisiKendaraanEnum = pgEnum('kondisi_kendaraan', KONDISI_KENDARAAN)

const timestamps = {
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

const golonganList = sql.raw(GOLONGAN.map((g) => `'${g}'`).join(', '))

export const perangkatDaerah = pgTable(
  'perangkat_daerah',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 150 }).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('perangkat_daerah_nama_lower_uq').on(sql`lower(${t.nama})`),
    index('perangkat_daerah_nama_trgm_idx').using('gin', sql`${t.nama} gin_trgm_ops`),
  ],
)

export const pegawai = pgTable(
  'pegawai',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: varchar('nama', { length: 150 }).notNull(),
    nip: char('nip', { length: 18 }).notNull(),
    jabatan: varchar('jabatan', { length: 150 }).notNull(),
    golongan: varchar('golongan', { length: 5 }).notNull(),
    perangkat_daerah_id: uuid('perangkat_daerah_id')
      .notNull()
      .references(() => perangkatDaerah.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('pegawai_nip_uq').on(t.nip),
    index('pegawai_perangkat_daerah_id_idx').on(t.perangkat_daerah_id),
    index('pegawai_nama_idx').on(t.nama),
    index('pegawai_nama_trgm_idx').using('gin', sql`${t.nama} gin_trgm_ops`),
    check('pegawai_nip_format_ck', sql`${t.nip} ~ '^[0-9]{18}$'`),
    check('pegawai_golongan_ck', sql`${t.golongan} IN (${golonganList})`),
  ],
)

export const kendaraanDinas = pgTable(
  'kendaraan_dinas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nomor_polisi: varchar('nomor_polisi', { length: 12 }).notNull(),
    merek: varchar('merek', { length: 50 }).notNull(),
    tipe_model: varchar('tipe_model', { length: 100 }).notNull(),
    tahun_produksi: smallint('tahun_produksi').notNull(),
    warna: varchar('warna', { length: 30 }).notNull(),
    kondisi: kondisiKendaraanEnum('kondisi').notNull().default('baik'),
    perangkat_daerah_id: uuid('perangkat_daerah_id')
      .notNull()
      .references(() => perangkatDaerah.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    pegawai_id: uuid('pegawai_id').references(() => pegawai.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
    keterangan: text('keterangan'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('kendaraan_dinas_nomor_polisi_uq').on(t.nomor_polisi),
    index('kendaraan_dinas_perangkat_daerah_id_idx').on(t.perangkat_daerah_id),
    index('kendaraan_dinas_pegawai_id_idx').on(t.pegawai_id),
    index('kendaraan_dinas_kondisi_idx').on(t.kondisi),
    index('kendaraan_dinas_nomor_polisi_trgm_idx').using(
      'gin',
      sql`${t.nomor_polisi} gin_trgm_ops`,
    ),
    index('kendaraan_dinas_merek_trgm_idx').using('gin', sql`${t.merek} gin_trgm_ops`),
    index('kendaraan_dinas_tipe_model_trgm_idx').using('gin', sql`${t.tipe_model} gin_trgm_ops`),
    check(
      'kendaraan_dinas_nomor_polisi_format_ck',
      sql`${t.nomor_polisi} ~ '^[A-Z]{1,2} [0-9]{1,4}( [A-Z]{1,3})?$'`,
    ),
    // Batas atas memakai tahun berjalan + 1 agar constraint tetap IMMUTABLE-safe;
    // batas tepat (tahun berjalan) divalidasi di layer aplikasi.
    check(
      'kendaraan_dinas_tahun_produksi_ck',
      sql`${t.tahun_produksi} >= 1980 AND ${t.tahun_produksi} <= 2100`,
    ),
  ],
)

export const perangkatDaerahRelations = relations(perangkatDaerah, ({ many }) => ({
  pegawai: many(pegawai),
  kendaraan: many(kendaraanDinas),
}))

export const pegawaiRelations = relations(pegawai, ({ one, many }) => ({
  perangkat_daerah: one(perangkatDaerah, {
    fields: [pegawai.perangkat_daerah_id],
    references: [perangkatDaerah.id],
  }),
  kendaraan: many(kendaraanDinas),
}))

export const kendaraanDinasRelations = relations(kendaraanDinas, ({ one }) => ({
  perangkat_daerah: one(perangkatDaerah, {
    fields: [kendaraanDinas.perangkat_daerah_id],
    references: [perangkatDaerah.id],
  }),
  penanggung_jawab: one(pegawai, {
    fields: [kendaraanDinas.pegawai_id],
    references: [pegawai.id],
  }),
}))

export type PerangkatDaerah = typeof perangkatDaerah.$inferSelect
export type NewPerangkatDaerah = typeof perangkatDaerah.$inferInsert
export type Pegawai = typeof pegawai.$inferSelect
export type NewPegawai = typeof pegawai.$inferInsert
export type KendaraanDinas = typeof kendaraanDinas.$inferSelect
export type NewKendaraanDinas = typeof kendaraanDinas.$inferInsert
