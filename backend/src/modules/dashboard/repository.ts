import { asc, eq, sql } from 'drizzle-orm'
import type { DbOrTx } from '../../db/client'
import { kendaraanDinas, pegawai, perangkatDaerah } from '../../db/schema'

/** Seluruh agregasi dihitung di SQL (COUNT ... FILTER + GROUP BY), bukan di JavaScript. */
const k = kendaraanDinas
const rekap = {
  total: sql<number>`count(${k.id})::int`,
  baik: sql<number>`count(${k.id}) filter (where ${k.kondisi} = 'baik')::int`,
  rusak_ringan: sql<number>`count(${k.id}) filter (where ${k.kondisi} = 'rusak_ringan')::int`,
  rusak_berat: sql<number>`count(${k.id}) filter (where ${k.kondisi} = 'rusak_berat')::int`,
  tanpa_penanggung_jawab: sql<number>`count(${k.id}) filter (where ${k.pegawai_id} is null)::int`,
}

export const dashboardRepository = {
  async ringkasanKendaraan(db: DbOrTx) {
    const [row] = await db
      .select({
        ...rekap,
        total_pegawai: sql<number>`(select count(*)::int from ${pegawai})`,
        total_perangkat_daerah: sql<number>`(select count(*)::int from ${perangkatDaerah})`,
      })
      .from(k)
    if (!row) throw new Error('Agregasi ringkasan tidak mengembalikan baris')
    return row
  },

  async perPerangkatDaerah(db: DbOrTx) {
    return db
      .select({
        perangkat_daerah: { id: perangkatDaerah.id, nama: perangkatDaerah.nama },
        ...rekap,
      })
      .from(perangkatDaerah)
      .leftJoin(k, eq(k.perangkat_daerah_id, perangkatDaerah.id))
      .groupBy(perangkatDaerah.id, perangkatDaerah.nama)
      .orderBy(asc(perangkatDaerah.nama))
  },
}
