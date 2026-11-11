import { db } from '../../db/client'
import type { DashboardRingkasan } from './model'
import { dashboardRepository as repo } from './repository'

const num = (v: unknown) => Number(v ?? 0)

export const dashboardService = {
  async ringkasan(): Promise<DashboardRingkasan> {
    const [r, perPd] = await Promise.all([repo.ringkasanKendaraan(db), repo.perPerangkatDaerah(db)])
    return {
      kendaraan: {
        total: num(r.total),
        baik: num(r.baik),
        rusak_ringan: num(r.rusak_ringan),
        rusak_berat: num(r.rusak_berat),
        tanpa_penanggung_jawab: num(r.tanpa_penanggung_jawab),
      },
      total_pegawai: num(r.total_pegawai),
      total_perangkat_daerah: num(r.total_perangkat_daerah),
      per_perangkat_daerah: perPd.map((p) => ({
        perangkat_daerah: p.perangkat_daerah,
        total: num(p.total),
        baik: num(p.baik),
        rusak_ringan: num(p.rusak_ringan),
        rusak_berat: num(p.rusak_berat),
        tanpa_penanggung_jawab: num(p.tanpa_penanggung_jawab),
      })),
    }
  },
}
