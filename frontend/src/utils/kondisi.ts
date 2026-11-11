import type { KondisiKendaraan } from '@/types/models'

export const KONDISI_LABEL: Record<KondisiKendaraan, string> = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_berat: 'Rusak Berat',
}

/** Kelas warna per kondisi: Baik = hijau, Rusak Ringan = kuning, Rusak Berat = merah. */
export const KONDISI_STYLE: Record<KondisiKendaraan, { badge: string; dot: string; bar: string }> =
  {
    baik: {
      badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500',
    },
    rusak_ringan: {
      badge: 'bg-amber-50 text-amber-800 ring-amber-600/25',
      dot: 'bg-amber-400',
      bar: 'bg-amber-400',
    },
    rusak_berat: {
      badge: 'bg-red-50 text-red-800 ring-red-600/20',
      dot: 'bg-red-500',
      bar: 'bg-red-500',
    },
  }
