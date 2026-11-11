import { and, asc, desc, eq, ilike, or, type SQL, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../db/client'
import {
  GOLONGAN,
  type Golongan,
  kendaraanDinas,
  type NewPegawai,
  pegawai,
  perangkatDaerah,
} from '../../db/schema'
import { escapeLike, type PageParams } from '../../lib/pagination'
import { toIso } from '../../lib/time'
import type { PEGAWAI_SORT } from './model'

type SortField = (typeof PEGAWAI_SORT)[number]

const jumlahKendaraan = sql<number>`(
  select count(*)::int from ${kendaraanDinas} k where k.pegawai_id = ${sql.raw('"pegawai"."id"')}
)`

// Urutan golongan mengikuti jenjang (I/a … IV/e), bukan urutan alfabet.
const golonganOrder = sql`array_position(ARRAY[${sql.raw(
  GOLONGAN.map((g) => `'${g}'`).join(','),
)}]::text[], ${pegawai.golongan}::text)`

const sortColumns: Record<SortField, SQL> = {
  nama: sql`${pegawai.nama}`,
  golongan: golonganOrder,
  nip: sql`${pegawai.nip}`,
  jabatan: sql`${pegawai.jabatan}`,
  created_at: sql`${pegawai.created_at}`,
}

const columns = {
  id: pegawai.id,
  nama: pegawai.nama,
  nip: pegawai.nip,
  jabatan: pegawai.jabatan,
  golongan: pegawai.golongan,
  perangkat_daerah_id: pegawai.perangkat_daerah_id,
  perangkat_daerah: { id: perangkatDaerah.id, nama: perangkatDaerah.nama },
  jumlah_kendaraan: jumlahKendaraan,
  created_at: pegawai.created_at,
  updated_at: pegawai.updated_at,
}

type Row = {
  id: string
  nama: string
  nip: string
  jabatan: string
  golongan: string
  perangkat_daerah_id: string
  perangkat_daerah: { id: string; nama: string }
  jumlah_kendaraan: number
  created_at: Date
  updated_at: Date
}

const toItem = (r: Row) => ({
  ...r,
  jumlah_kendaraan: Number(r.jumlah_kendaraan),
  created_at: toIso(r.created_at),
  updated_at: toIso(r.updated_at),
})

export interface PegawaiFilter {
  search?: string
  perangkat_daerah_id?: string
  golongan?: Golongan
}

function buildWhere(f: PegawaiFilter): SQL | undefined {
  const conditions: (SQL | undefined)[] = []
  if (f.search) {
    const term = `%${escapeLike(f.search)}%`
    conditions.push(or(ilike(pegawai.nama, term), ilike(pegawai.nip, term)))
  }
  if (f.perangkat_daerah_id) conditions.push(eq(pegawai.perangkat_daerah_id, f.perangkat_daerah_id))
  if (f.golongan) conditions.push(eq(pegawai.golongan, f.golongan))
  return conditions.length ? and(...conditions) : undefined
}

export const pegawaiRepository = {
  async list(
    db: DbOrTx,
    opts: { page: PageParams; filter: PegawaiFilter; sort: { field: SortField; desc: boolean } },
  ) {
    const where = buildWhere(opts.filter)
    const col = sortColumns[opts.sort.field]
    const [rows, total] = await Promise.all([
      db
        .select(columns)
        .from(pegawai)
        .innerJoin(perangkatDaerah, eq(perangkatDaerah.id, pegawai.perangkat_daerah_id))
        .where(where)
        .orderBy(opts.sort.desc ? desc(col) : asc(col), asc(pegawai.nama), asc(pegawai.id))
        .limit(opts.page.per_page)
        .offset(opts.page.offset),
      db.$count(pegawai, where),
    ])
    return { items: rows.map(toItem), total }
  },

  async findById(db: DbOrTx, id: string) {
    const [row] = await db
      .select(columns)
      .from(pegawai)
      .innerJoin(perangkatDaerah, eq(perangkatDaerah.id, pegawai.perangkat_daerah_id))
      .where(eq(pegawai.id, id))
    return row ? toItem(row) : undefined
  },

  /** Ambil & kunci pegawai di dalam transaksi. `share` dipakai saat hanya perlu mencegah perubahan. */
  async lock(tx: DbOrTx, id: string, mode: 'update' | 'share' = 'update') {
    const [row] = await tx
      .select({
        id: pegawai.id,
        nama: pegawai.nama,
        perangkat_daerah_id: pegawai.perangkat_daerah_id,
      })
      .from(pegawai)
      .where(eq(pegawai.id, id))
      .for(mode)
    return row
  },

  async kendaraanDipegang(db: DbOrTx, pegawaiId: string) {
    return db
      .select({
        id: kendaraanDinas.id,
        nomor_polisi: kendaraanDinas.nomor_polisi,
        merek: kendaraanDinas.merek,
        tipe_model: kendaraanDinas.tipe_model,
        tahun_produksi: kendaraanDinas.tahun_produksi,
        kondisi: kendaraanDinas.kondisi,
        perangkat_daerah_id: kendaraanDinas.perangkat_daerah_id,
      })
      .from(kendaraanDinas)
      .where(eq(kendaraanDinas.pegawai_id, pegawaiId))
      .orderBy(asc(kendaraanDinas.nomor_polisi))
  },

  async insert(db: DbOrTx, values: NewPegawai) {
    const [row] = await db.insert(pegawai).values(values).returning({ id: pegawai.id })
    if (!row) throw new Error('INSERT tidak mengembalikan id')
    return row.id
  },

  async update(db: DbOrTx, id: string, values: Omit<NewPegawai, 'id'>) {
    await db.update(pegawai).set(values).where(eq(pegawai.id, id))
  },

  async delete(db: DbOrTx, id: string) {
    await db.delete(pegawai).where(eq(pegawai.id, id))
  },
}
