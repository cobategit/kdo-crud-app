import { t } from 'elysia'
import { RefPerangkatDaerah } from '../../lib/schemas'

const RekapKondisi = {
  total: t.Number(),
  baik: t.Number(),
  rusak_ringan: t.Number(),
  rusak_berat: t.Number(),
  tanpa_penanggung_jawab: t.Number(),
}

export const DashboardModel = {
  ringkasan: t.Object({
    kendaraan: t.Object(RekapKondisi),
    total_pegawai: t.Number(),
    total_perangkat_daerah: t.Number(),
    per_perangkat_daerah: t.Array(
      t.Object({ perangkat_daerah: RefPerangkatDaerah, ...RekapKondisi }),
    ),
  }),
}

export type DashboardRingkasan = typeof DashboardModel.ringkasan.static
