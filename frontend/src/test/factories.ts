import type { Kendaraan, Pegawai, PerangkatDaerah } from '@/types/models'

const ts = { created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }
export const meta = (total: number, page = 1, per_page = 10) => ({
  page,
  per_page,
  total,
  total_pages: Math.max(1, Math.ceil(total / per_page)),
})

export const pd = (over: Partial<PerangkatDaerah> = {}): PerangkatDaerah => ({
  id: 'pd-1',
  nama: 'Dinas Kesehatan',
  jumlah_pegawai: 0,
  jumlah_kendaraan: 0,
  ...ts,
  ...over,
})

export const pegawai = (over: Partial<Pegawai> = {}): Pegawai => ({
  id: 'pg-1',
  nama: 'Siti Aminah',
  nip: '199001012015032001',
  jabatan: 'Analis',
  golongan: 'III/b',
  perangkat_daerah_id: 'pd-1',
  perangkat_daerah: { id: 'pd-1', nama: 'Dinas Kesehatan' },
  jumlah_kendaraan: 0,
  ...ts,
  ...over,
})

export const kendaraan = (over: Partial<Kendaraan> = {}): Kendaraan => ({
  id: 'k-1',
  nomor_polisi: 'B 1234 ABC',
  merek: 'Toyota',
  tipe_model: 'Avanza',
  tahun_produksi: 2020,
  warna: 'Hitam',
  kondisi: 'baik',
  perangkat_daerah_id: 'pd-1',
  pegawai_id: null,
  keterangan: null,
  perangkat_daerah: { id: 'pd-1', nama: 'Dinas Kesehatan' },
  penanggung_jawab: null,
  ...ts,
  ...over,
})
