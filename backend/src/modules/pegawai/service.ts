import { db } from '../../db/client'
import { GOLONGAN } from '../../db/schema'
import { assertOneOf, NotFoundError, RelationInUseError, ValidationError } from '../../lib/errors'
import { buildMeta, parseSort, resolvePage } from '../../lib/pagination'
import { cleanText, requireText } from '../../lib/text'
import { perangkatDaerahRepository } from '../perangkat-daerah/repository'
import { PEGAWAI_SORT, type PegawaiBody, type PegawaiListQuery } from './model'
import { pegawaiRepository as repo } from './repository'

const ENTITAS = 'Pegawai'

function normalize(body: PegawaiBody) {
  return {
    nama: requireText(body.nama, 'nama', 'Nama'),
    nip: body.nip,
    jabatan: requireText(body.jabatan, 'jabatan', 'Jabatan'),
    golongan: body.golongan,
    perangkat_daerah_id: body.perangkat_daerah_id,
  }
}

const perangkatDaerahTidakDitemukan = () =>
  new ValidationError('Data tidak valid', [
    { field: 'perangkat_daerah_id', message: 'Perangkat daerah tidak ditemukan' },
  ])

const daftarNopol = (rows: { nomor_polisi: string }[]) => rows.map((r) => r.nomor_polisi).join(', ')

export const pegawaiService = {
  async list(query: PegawaiListQuery) {
    const page = resolvePage(query.page, query.per_page)
    const sort = parseSort(query.sort, PEGAWAI_SORT, { field: 'nama', desc: false })
    const { items, total } = await repo.list(db, {
      page,
      sort,
      filter: {
        search: query.search ? cleanText(query.search) : undefined,
        perangkat_daerah_id: query.perangkat_daerah_id,
        golongan: assertOneOf(query.golongan, GOLONGAN, 'golongan'),
      },
    })
    return { items, meta: buildMeta(page, total) }
  },

  async getById(id: string) {
    const [item, kendaraan] = await Promise.all([
      repo.findById(db, id),
      repo.kendaraanDipegang(db, id),
    ])
    if (!item) throw new NotFoundError(ENTITAS)
    return {
      ...item,
      kendaraan: kendaraan.map(({ perangkat_daerah_id: _, ...k }) => k),
    }
  },

  async create(body: PegawaiBody) {
    const values = normalize(body)
    const id = await db.transaction(async (tx) => {
      // FOR SHARE: perangkat daerah tidak boleh terhapus selama transaksi berjalan
      const pd = await perangkatDaerahRepository.lock(tx, values.perangkat_daerah_id, 'share')
      if (!pd) throw perangkatDaerahTidakDitemukan()
      return repo.insert(tx, values)
    })
    return this.getById(id)
  },

  async update(id: string, body: PegawaiBody) {
    const values = normalize(body)
    await db.transaction(async (tx) => {
      const current = await repo.lock(tx, id)
      if (!current) throw new NotFoundError(ENTITAS)

      if (current.perangkat_daerah_id !== values.perangkat_daerah_id) {
        const pd = await perangkatDaerahRepository.lock(tx, values.perangkat_daerah_id, 'share')
        if (!pd) throw perangkatDaerahTidakDitemukan()
        const dipegang = (await repo.kendaraanDipegang(tx, id)).filter(
          (k) => k.perangkat_daerah_id === current.perangkat_daerah_id,
        )
        if (dipegang.length > 0) {
          throw new RelationInUseError(
            `Pegawai "${current.nama}" tidak dapat dipindahkan karena masih menjadi penanggung jawab kendaraan ${daftarNopol(dipegang)} di perangkat daerah lama. Ganti atau kosongkan penanggung jawab kendaraan tersebut terlebih dahulu.`,
          )
        }
      }
      await repo.update(tx, id, values)
    })
    return this.getById(id)
  },

  async remove(id: string): Promise<{ id: string }> {
    await db.transaction(async (tx) => {
      const current = await repo.lock(tx, id)
      if (!current) throw new NotFoundError(ENTITAS)
      const dipegang = await repo.kendaraanDipegang(tx, id)
      if (dipegang.length > 0) {
        throw new RelationInUseError(
          `Pegawai "${current.nama}" tidak dapat dihapus karena masih menjadi penanggung jawab kendaraan ${daftarNopol(dipegang)}.`,
        )
      }
      await repo.delete(tx, id)
    })
    return { id }
  },
}
