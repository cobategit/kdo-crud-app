export const KONDISI_KENDARAAN = ['baik', 'rusak_ringan', 'rusak_berat'] as const
export type KondisiKendaraan = (typeof KONDISI_KENDARAAN)[number]

export const GOLONGAN = [
  'I/a',
  'I/b',
  'I/c',
  'I/d',
  'II/a',
  'II/b',
  'II/c',
  'II/d',
  'III/a',
  'III/b',
  'III/c',
  'III/d',
  'IV/a',
  'IV/b',
  'IV/c',
  'IV/d',
  'IV/e',
] as const
export type Golongan = (typeof GOLONGAN)[number]

export interface RefPerangkatDaerah {
  id: string
  nama: string
}

export interface Timestamps {
  created_at: string
  updated_at: string
}

export interface PerangkatDaerah extends Timestamps {
  id: string
  nama: string
  jumlah_pegawai: number
  jumlah_kendaraan: number
}

export interface RekapKondisi {
  baik: number
  rusak_ringan: number
  rusak_berat: number
  tanpa_penanggung_jawab: number
}

export interface PerangkatDaerahDetail extends PerangkatDaerah {
  rekap_kondisi: RekapKondisi
}

export interface PerangkatDaerahPayload {
  nama: string
}

export interface Pegawai extends Timestamps {
  id: string
  nama: string
  nip: string
  jabatan: string
  golongan: Golongan
  perangkat_daerah_id: string
  perangkat_daerah: RefPerangkatDaerah
  jumlah_kendaraan: number
}

export interface KendaraanRingkas {
  id: string
  nomor_polisi: string
  merek: string
  tipe_model: string
  tahun_produksi: number
  kondisi: KondisiKendaraan
}

export interface PegawaiDetail extends Pegawai {
  kendaraan: KendaraanRingkas[]
}

export interface PegawaiPayload {
  nama: string
  nip: string
  jabatan: string
  golongan: Golongan
  perangkat_daerah_id: string
}

export interface PenanggungJawab {
  id: string
  nama: string
  nip: string
  jabatan: string
  golongan: string
}

export interface Kendaraan extends Timestamps {
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
  perangkat_daerah: RefPerangkatDaerah
  penanggung_jawab: PenanggungJawab | null
}

export interface KendaraanPayload {
  nomor_polisi: string
  merek: string
  tipe_model: string
  tahun_produksi: number
  warna: string
  kondisi: KondisiKendaraan
  perangkat_daerah_id: string
  pegawai_id: string | null
  keterangan: string | null
}

export interface RekapKondisiTotal extends RekapKondisi {
  total: number
}

export interface DashboardRingkasan {
  kendaraan: RekapKondisiTotal
  total_pegawai: number
  total_perangkat_daerah: number
  per_perangkat_daerah: (RekapKondisiTotal & { perangkat_daerah: RefPerangkatDaerah })[]
}

/** Parameter query list standar. */
export interface ListParams {
  page?: number
  per_page?: number
  search?: string
  sort?: string
}

export interface PegawaiListParams extends ListParams {
  perangkat_daerah_id?: string
  golongan?: string
}

export interface KendaraanListParams extends ListParams {
  kondisi?: string
  perangkat_daerah_id?: string
  pegawai_id?: string
  tahun_produksi?: number
  tanpa_penanggung_jawab?: boolean
}
