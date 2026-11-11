import { and, asc, desc, eq, ilike, isNull, or, type SQL, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../db/client'
import {
  type KondisiKendaraan,
  kendaraanDinas,
  type NewKendaraanDinas,
  pegawai,
  perangkatDaerah,
} from '../../db/schema'
import { escapeLike, type PageParams } from '../../lib/pagination'
import { toIso } from '../../lib/time'
import type { KENDARAAN_SORT } from './model'

type SortField = (typeof KENDARAAN_SORT)[number]

const sortColumns: Record<SortField, SQL> = {
  nomor_polisi: sql`${kendaraanDinas.nomor_polisi}`,
  merek: sql`${kendaraanDinas.merek}`,
  tipe_model: sql`${kendaraanDinas.tipe_model}`,
  tahun_produksi: sql`${kendaraanDinas.tahun_produksi}`,
  // urutan enum: baik < rusak_ringan < rusak_berat
  kondisi: sql`${kendaraanDinas.kondisi}`,
  created_at: sql`${kendaraanDinas.created_at}`,
}

const columns = {
  id: kendaraanDinas.id,
  nomor_polisi: kendaraanDinas.nomor_polisi,
  merek: kendaraanDinas.merek,
  tipe_model: kendaraanDinas.tipe_model,
  tahun_produksi: kendaraanDinas.tahun_produksi,
  warna: kendaraanDinas.warna,
  kondisi: kendaraanDinas.kondisi,
  perangkat_daerah_id: kendaraanDinas.perangkat_daerah_id,
  pegawai_id: kendaraanDinas.pegawai_id,
  keterangan: kendaraanDinas.keterangan,
  perangkat_daerah: { id: perangkatDaerah.id, nama: perangkatDaerah.nama },
  pj_id: pegawai.id,
  pj_nama: pegawai.nama,
  pj_nip: pegawai.nip,
  pj_jabatan: pegawai.jabatan,
  pj_golongan: pegawai.golongan,
  created_at: kendaraanDinas.created_at,
  updated_at: kendaraanDinas.updated_at,
}

type Row = {
  id: string
  nomor_polisi: string
  merek: string
  tipe_model: string
  tahun_produksi: number
  warna: string
  kondisi: KondisiKendaraan
  perangkat_daerah_id: string
  pegawai_id: string | null
  keterangan: string | null
  perangkat_daerah: { id: string; nama: string }
  pj_id: string | null
  pj_nama: string | null
  pj_nip: string | null
  pj_jabatan: string | null
  pj_golongan: string | null
  created_at: Date
  updated_at: Date
}

function toItem(r: Row) {
  const { pj_id, pj_nama, pj_nip, pj_jabatan, pj_golongan, ...rest } = r
  return {
    ...rest,
    penanggung_jawab: pj_id
      ? {
          id: pj_id,
          nama: pj_nama ?? '',
          nip: pj_nip ?? '',
          jabatan: pj_jabatan ?? '',
          golongan: pj_golongan ?? '',
        }
      : null,
    created_at: toIso(r.created_at),
    updated_at: toIso(r.updated_at),
  }
}

export interface KendaraanFilter {
  search?: string
  kondisi?: KondisiKendaraan
  perangkat_daerah_id?: string
  pegawai_id?: string
  tahun_produksi?: number
  tanpa_penanggung_jawab?: boolean
}

function buildWhere(f: KendaraanFilter): SQL | undefined {
  const c: (SQL | undefined)[] = []
  if (f.search) {
    const term = `%${escapeLike(f.search)}%`
    // "B1234" tetap cocok dengan "B 1234 ABC"
    const compact = `%${escapeLike(f.search.replace(/\s+/g, ''))}%`
    c.push(
      or(
        ilike(kendaraanDinas.nomor_polisi, term),
        sql`replace(${kendaraanDinas.nomor_polisi}, ' ', '') ilike ${compact}`,
        ilike(kendaraanDinas.merek, term),
        ilike(kendaraanDinas.tipe_model, term),
      ),
    )
  }
  if (f.kondisi) c.push(eq(kendaraanDinas.kondisi, f.kondisi))
  if (f.perangkat_daerah_id) c.push(eq(kendaraanDinas.perangkat_daerah_id, f.perangkat_daerah_id))
  if (f.pegawai_id) c.push(eq(kendaraanDinas.pegawai_id, f.pegawai_id))
  if (f.tahun_produksi) c.push(eq(kendaraanDinas.tahun_produksi, f.tahun_produksi))
  if (f.tanpa_penanggung_jawab === true) c.push(isNull(kendaraanDinas.pegawai_id))
  if (f.tanpa_penanggung_jawab === false) c.push(sql`${kendaraanDinas.pegawai_id} is not null`)
  return c.length ? and(...c) : undefined
}

function baseSelect(db: DbOrTx) {
  return db
    .select(columns)
    .from(kendaraanDinas)
    .innerJoin(perangkatDaerah, eq(perangkatDaerah.id, kendaraanDinas.perangkat_daerah_id))
    .leftJoin(pegawai, eq(pegawai.id, kendaraanDinas.pegawai_id))
}

export const kendaraanRepository = {
  async list(
    db: DbOrTx,
    opts: { page: PageParams; filter: KendaraanFilter; sort: { field: SortField; desc: boolean } },
  ) {
    const where = buildWhere(opts.filter)
    const col = sortColumns[opts.sort.field]
    const [rows, total] = await Promise.all([
      baseSelect(db)
        .where(where)
        .orderBy(opts.sort.desc ? desc(col) : asc(col), asc(kendaraanDinas.nomor_polisi))
        .limit(opts.page.per_page)
        .offset(opts.page.offset),
      db.$count(kendaraanDinas, where),
    ])
    return { items: rows.map(toItem), total }
  },

  async findById(db: DbOrTx, id: string) {
    const [row] = await baseSelect(db).where(eq(kendaraanDinas.id, id))
    return row ? toItem(row) : undefined
  },

  async lock(tx: DbOrTx, id: string) {
    const [row] = await tx
      .select({ id: kendaraanDinas.id })
      .from(kendaraanDinas)
      .where(eq(kendaraanDinas.id, id))
      .for('update')
    return row
  },

  async insert(db: DbOrTx, values: NewKendaraanDinas) {
    const [row] = await db
      .insert(kendaraanDinas)
      .values(values)
      .returning({ id: kendaraanDinas.id })
    if (!row) throw new Error('INSERT tidak mengembalikan id')
    return row.id
  },

  async update(db: DbOrTx, id: string, values: Partial<Omit<NewKendaraanDinas, 'id'>>) {
    const rows = await db
      .update(kendaraanDinas)
      .set(values)
      .where(eq(kendaraanDinas.id, id))
      .returning({ id: kendaraanDinas.id })
    return rows.length > 0
  },

  async delete(db: DbOrTx, id: string) {
    const rows = await db
      .delete(kendaraanDinas)
      .where(eq(kendaraanDinas.id, id))
      .returning({ id: kendaraanDinas.id })
    return rows.length > 0
  },
}
