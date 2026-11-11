import { db } from '../../db/client'
import { NotFoundError, RelationInUseError } from '../../lib/errors'
import { buildMeta, parseSort, resolvePage } from '../../lib/pagination'
import { cleanText, requireText } from '../../lib/text'
import {
  PERANGKAT_DAERAH_SORT,
  type PerangkatDaerahBody,
  type PerangkatDaerahDetail,
  type PerangkatDaerahListQuery,
} from './model'
import { perangkatDaerahRepository as repo } from './repository'

const ENTITAS = 'Perangkat daerah'

export const perangkatDaerahService = {
  async list(query: PerangkatDaerahListQuery) {
    const page = resolvePage(query.page, query.per_page)
    const sort = parseSort(query.sort, PERANGKAT_DAERAH_SORT, { field: 'nama', desc: false })
    const search = query.search ? cleanText(query.search) : undefined
    const { items, total } = await repo.list(db, { page, search, sort })
    return { items, meta: buildMeta(page, total) }
  },

  async getById(id: string): Promise<PerangkatDaerahDetail> {
    const [item, rekap_kondisi] = await Promise.all([
      repo.findById(db, id),
      repo.rekapKondisi(db, id),
    ])
    if (!item) throw new NotFoundError(ENTITAS)
    return { ...item, rekap_kondisi }
  },

  async create(body: PerangkatDaerahBody) {
    const nama = requireText(body.nama, 'nama', 'Nama perangkat daerah')
    const id = await repo.insert(db, nama)
    return this.getById(id)
  },

  async update(id: string, body: PerangkatDaerahBody) {
    const nama = requireText(body.nama, 'nama', 'Nama perangkat daerah')
    const updated = await repo.update(db, id, nama)
    if (!updated) throw new NotFoundError(ENTITAS)
    return this.getById(id)
  },

  /** Hapus ditolak bila masih memiliki pegawai/kendaraan (dicek di dalam transaksi + FK RESTRICT). */
  async remove(id: string): Promise<{ id: string }> {
    await db.transaction(async (tx) => {
      const row = await repo.lock(tx, id)
      if (!row) throw new NotFoundError(ENTITAS)
      const jumlah = await repo.countRelations(tx, id)
      if (jumlah.pegawai > 0 || jumlah.kendaraan > 0) {
        const bagian = [
          jumlah.pegawai > 0 ? `${jumlah.pegawai} pegawai` : null,
          jumlah.kendaraan > 0 ? `${jumlah.kendaraan} kendaraan` : null,
        ].filter(Boolean)
        throw new RelationInUseError(
          `Perangkat daerah "${row.nama}" tidak dapat dihapus karena masih memiliki ${bagian.join(' dan ')}.`,
        )
      }
      await repo.delete(tx, id)
    })
    return { id }
  },
}
