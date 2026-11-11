import { db, type Tx } from '../../db/client'
import { KONDISI_KENDARAAN, type KondisiKendaraan } from '../../db/schema'
import {
  assertOneOf,
  InvalidPenanggungJawabError,
  NotFoundError,
  ValidationError,
} from '../../lib/errors'
import { isValidNomorPolisi, normalizeNomorPolisi } from '../../lib/nomor-polisi'
import { buildMeta, parseSort, resolvePage } from '../../lib/pagination'
import { cleanText, optionalText, requireText } from '../../lib/text'
import { tahunBerjalan } from '../../lib/time'
import { pegawaiRepository } from '../pegawai/repository'
import { perangkatDaerahRepository } from '../perangkat-daerah/repository'
import { KENDARAAN_SORT, type KendaraanBody, type KendaraanListQuery } from './model'
import { kendaraanRepository as repo } from './repository'

const ENTITAS = 'Kendaraan'

function normalize(body: KendaraanBody) {
  const details: { field: string; message: string }[] = []

  const nomor_polisi = normalizeNomorPolisi(body.nomor_polisi)
  if (!isValidNomorPolisi(nomor_polisi)) {
    details.push({
      field: 'nomor_polisi',
      message: 'Format nomor polisi tidak valid (contoh: B 1234 ABC)',
    })
  }
  const tahunMaks = tahunBerjalan()
  if (body.tahun_produksi > tahunMaks) {
    details.push({
      field: 'tahun_produksi',
      message: `Tahun produksi harus antara 1980 dan ${tahunMaks}`,
    })
  }
  if (details.length) throw new ValidationError('Data tidak valid', details)

  return {
    nomor_polisi,
    merek: requireText(body.merek, 'merek', 'Merek'),
    tipe_model: requireText(body.tipe_model, 'tipe_model', 'Tipe/model'),
    tahun_produksi: body.tahun_produksi,
    warna: requireText(body.warna, 'warna', 'Warna'),
    kondisi: body.kondisi,
    perangkat_daerah_id: body.perangkat_daerah_id,
    pegawai_id: body.pegawai_id ?? null,
    keterangan: optionalText(body.keterangan),
  }
}

/**
 * Aturan bisnis lintas entitas (dijalankan di dalam transaksi):
 * - perangkat daerah harus ada
 * - penanggung jawab (bila diisi) harus pegawai dari perangkat daerah yang sama
 * Baris yang dirujuk dikunci FOR SHARE agar tidak berubah/terhapus hingga transaksi selesai.
 */
async function assertRelasiValid(
  tx: Tx,
  values: { perangkat_daerah_id: string; pegawai_id: string | null },
) {
  const pd = await perangkatDaerahRepository.lock(tx, values.perangkat_daerah_id, 'share')
  if (!pd) {
    throw new ValidationError('Data tidak valid', [
      { field: 'perangkat_daerah_id', message: 'Perangkat daerah tidak ditemukan' },
    ])
  }
  if (!values.pegawai_id) return

  const pj = await pegawaiRepository.lock(tx, values.pegawai_id, 'share')
  if (!pj) {
    throw new ValidationError('Data tidak valid', [
      { field: 'pegawai_id', message: 'Pegawai penanggung jawab tidak ditemukan' },
    ])
  }
  if (pj.perangkat_daerah_id !== values.perangkat_daerah_id) {
    throw new InvalidPenanggungJawabError(
      `Penanggung jawab "${pj.nama}" bukan pegawai ${pd.nama}. Pilih pegawai dari perangkat daerah yang sama atau kosongkan penanggung jawab.`,
    )
  }
}

export const kendaraanService = {
  async list(query: KendaraanListQuery) {
    const page = resolvePage(query.page, query.per_page)
    const sort = parseSort(query.sort, KENDARAAN_SORT, { field: 'nomor_polisi', desc: false })
    const { items, total } = await repo.list(db, {
      page,
      sort,
      filter: {
        search: query.search ? cleanText(query.search) : undefined,
        kondisi: assertOneOf(query.kondisi, KONDISI_KENDARAAN, 'kondisi'),
        perangkat_daerah_id: query.perangkat_daerah_id,
        pegawai_id: query.pegawai_id,
        tahun_produksi: query.tahun_produksi,
        tanpa_penanggung_jawab: query.tanpa_penanggung_jawab,
      },
    })
    return { items, meta: buildMeta(page, total) }
  },

  async getById(id: string) {
    const item = await repo.findById(db, id)
    if (!item) throw new NotFoundError(ENTITAS)
    return item
  },

  async create(body: KendaraanBody) {
    const values = normalize(body)
    const id = await db.transaction(async (tx) => {
      await assertRelasiValid(tx, values)
      return repo.insert(tx, values)
    })
    return this.getById(id)
  },

  /**
   * PUT = penggantian penuh. Bila perangkat daerah diganti sementara `pegawai_id` masih menunjuk
   * pegawai perangkat daerah lama, request ditolak (PENANGGUNG_JAWAB_TIDAK_VALID).
   */
  async update(id: string, body: KendaraanBody) {
    const values = normalize(body)
    await db.transaction(async (tx) => {
      if (!(await repo.lock(tx, id))) throw new NotFoundError(ENTITAS)
      await assertRelasiValid(tx, values)
      await repo.update(tx, id, values)
    })
    return this.getById(id)
  },

  async updateKondisi(id: string, kondisi: KondisiKendaraan) {
    const updated = await repo.update(db, id, { kondisi })
    if (!updated) throw new NotFoundError(ENTITAS)
    return this.getById(id)
  },

  async remove(id: string): Promise<{ id: string }> {
    const deleted = await repo.delete(db, id)
    if (!deleted) throw new NotFoundError(ENTITAS)
    return { id }
  },
}
