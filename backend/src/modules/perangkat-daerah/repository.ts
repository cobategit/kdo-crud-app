import { asc, desc, eq, ilike, type SQL, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../db/client'
import { kendaraanDinas, pegawai, perangkatDaerah } from '../../db/schema'
import { escapeLike, type PageParams } from '../../lib/pagination'
import { toIso } from '../../lib/time'
import type { PERANGKAT_DAERAH_SORT } from './model'

type SortField = (typeof PERANGKAT_DAERAH_SORT)[number]

// Referensi kolom luar ditulis eksplisit dengan nama tabel karena Drizzle tidak menambahkan
// prefix tabel pada query satu tabel (tanpa join), sehingga "id" akan merujuk tabel subquery.
const outerId = sql.raw('"perangkat_daerah"."id"')
const jumlahPegawai = sql<number>`(
  select count(*)::int from ${pegawai} p where p.perangkat_daerah_id = ${outerId}
)`
const jumlahKendaraan = sql<number>`(
  select count(*)::int from ${kendaraanDinas} k where k.perangkat_daerah_id = ${outerId}
)`

const columns = {
  id: perangkatDaerah.id,
  nama: perangkatDaerah.nama,
  jumlah_pegawai: jumlahPegawai,
  jumlah_kendaraan: jumlahKendaraan,
  created_at: perangkatDaerah.created_at,
  updated_at: perangkatDaerah.updated_at,
}

type Row = {
  id: string
  nama: string
  jumlah_pegawai: number
  jumlah_kendaraan: number
  created_at: Date
  updated_at: Date
}

const toItem = (r: Row) => ({
  ...r,
  jumlah_pegawai: Number(r.jumlah_pegawai),
  jumlah_kendaraan: Number(r.jumlah_kendaraan),
  created_at: toIso(r.created_at),
  updated_at: toIso(r.updated_at),
})

const sortColumns: Record<SortField, SQL | typeof perangkatDaerah.nama> = {
  nama: perangkatDaerah.nama,
  created_at: sql`${perangkatDaerah.created_at}`,
  jumlah_pegawai: jumlahPegawai,
  jumlah_kendaraan: jumlahKendaraan,
}

export const perangkatDaerahRepository = {
  async list(
    db: DbOrTx,
    opts: { page: PageParams; search?: string; sort: { field: SortField; desc: boolean } },
  ) {
    const where = opts.search
      ? ilike(perangkatDaerah.nama, `%${escapeLike(opts.search)}%`)
      : undefined
    const order = opts.sort.desc
      ? desc(sortColumns[opts.sort.field])
      : asc(sortColumns[opts.sort.field])

    const [rows, total] = await Promise.all([
      db
        .select(columns)
        .from(perangkatDaerah)
        .where(where)
        .orderBy(order, asc(perangkatDaerah.nama))
        .limit(opts.page.per_page)
        .offset(opts.page.offset),
      db.$count(perangkatDaerah, where),
    ])
    return { items: rows.map(toItem), total }
  },

  async findById(db: DbOrTx, id: string) {
    const [row] = await db.select(columns).from(perangkatDaerah).where(eq(perangkatDaerah.id, id))
    return row ? toItem(row) : undefined
  },

  async exists(db: DbOrTx, id: string): Promise<boolean> {
    const [row] = await db
      .select({ id: perangkatDaerah.id })
      .from(perangkatDaerah)
      .where(eq(perangkatDaerah.id, id))
    return Boolean(row)
  },

  /**
   * Kunci baris perangkat daerah di dalam transaksi.
   * `update` untuk ubah/hapus; `share` cukup untuk mencegah baris terhapus saat dirujuk.
   */
  async lock(tx: DbOrTx, id: string, mode: 'update' | 'share' = 'update') {
    const [row] = await tx
      .select({ id: perangkatDaerah.id, nama: perangkatDaerah.nama })
      .from(perangkatDaerah)
      .where(eq(perangkatDaerah.id, id))
      .for(mode)
    return row
  },

  async rekapKondisi(db: DbOrTx, id: string) {
    const [row] = await db
      .select({
        baik: sql<number>`count(*) filter (where ${kendaraanDinas.kondisi} = 'baik')::int`,
        rusak_ringan: sql<number>`count(*) filter (where ${kendaraanDinas.kondisi} = 'rusak_ringan')::int`,
        rusak_berat: sql<number>`count(*) filter (where ${kendaraanDinas.kondisi} = 'rusak_berat')::int`,
        tanpa_penanggung_jawab: sql<number>`count(*) filter (where ${kendaraanDinas.pegawai_id} is null)::int`,
      })
      .from(kendaraanDinas)
      .where(eq(kendaraanDinas.perangkat_daerah_id, id))
    return {
      baik: Number(row?.baik ?? 0),
      rusak_ringan: Number(row?.rusak_ringan ?? 0),
      rusak_berat: Number(row?.rusak_berat ?? 0),
      tanpa_penanggung_jawab: Number(row?.tanpa_penanggung_jawab ?? 0),
    }
  },

  async countRelations(db: DbOrTx, id: string) {
    const [row] = await db
      .select({ pegawai: jumlahPegawai, kendaraan: jumlahKendaraan })
      .from(perangkatDaerah)
      .where(eq(perangkatDaerah.id, id))
    return { pegawai: Number(row?.pegawai ?? 0), kendaraan: Number(row?.kendaraan ?? 0) }
  },

  async insert(db: DbOrTx, nama: string) {
    const [row] = await db
      .insert(perangkatDaerah)
      .values({ nama })
      .returning({ id: perangkatDaerah.id })
    if (!row) throw new Error('INSERT tidak mengembalikan id')
    return row.id
  },

  async update(db: DbOrTx, id: string, nama: string): Promise<boolean> {
    const rows = await db
      .update(perangkatDaerah)
      .set({ nama })
      .where(eq(perangkatDaerah.id, id))
      .returning({ id: perangkatDaerah.id })
    return rows.length > 0
  },

  async delete(db: DbOrTx, id: string) {
    await db.delete(perangkatDaerah).where(eq(perangkatDaerah.id, id))
  },
}
