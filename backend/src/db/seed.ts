import { sql } from 'drizzle-orm'
import { closeDb, db } from './client'
import {
  type Golongan,
  type KondisiKendaraan,
  kendaraanDinas,
  pegawai,
  perangkatDaerah,
} from './schema'

/**
 * Seeder idempoten: aman dijalankan berulang kali.
 * - Perangkat daerah dicocokkan berdasarkan lower(nama)
 * - Pegawai dicocokkan berdasarkan NIP
 * - Kendaraan dicocokkan berdasarkan nomor polisi
 * Data yang sudah ada tidak ditimpa sehingga perubahan pengguna tetap aman.
 */

const PERANGKAT_DAERAH = [
  'Dinas Pendidikan',
  'Dinas Kesehatan',
  'Dinas Pekerjaan Umum dan Penataan Ruang',
] as const
type NamaPD = (typeof PERANGKAT_DAERAH)[number]

interface SeedPegawai {
  nama: string
  nip: string
  jabatan: string
  golongan: Golongan
  pd: NamaPD
}

// NIP 18 digit: tgl lahir (8) + TMT CPNS tahun-bulan (6) + jenis kelamin (1) + nomor urut (3)
const PEGAWAI: SeedPegawai[] = [
  // Dinas Pendidikan
  {
    pd: 'Dinas Pendidikan',
    nama: 'Dr. H. Ahmad Fauzi, M.Pd.',
    nip: '197203151998031004',
    jabatan: 'Kepala Dinas',
    golongan: 'IV/c',
  },
  {
    pd: 'Dinas Pendidikan',
    nama: 'Sri Wahyuni, S.E., M.M.',
    nip: '197608222001122002',
    jabatan: 'Sekretaris Dinas',
    golongan: 'IV/b',
  },
  {
    pd: 'Dinas Pendidikan',
    nama: 'Budi Santoso, S.Pd.',
    nip: '198105102006041011',
    jabatan: 'Kepala Bidang Pembinaan SD',
    golongan: 'IV/a',
  },
  {
    pd: 'Dinas Pendidikan',
    nama: 'Rina Marlina, S.Kom.',
    nip: '198911032014032003',
    jabatan: 'Analis Data Pendidikan',
    golongan: 'III/b',
  },
  {
    pd: 'Dinas Pendidikan',
    nama: 'Joko Prasetyo',
    nip: '198502172009011007',
    jabatan: 'Pengemudi',
    golongan: 'II/c',
  },
  // Dinas Kesehatan
  {
    pd: 'Dinas Kesehatan',
    nama: 'dr. Hj. Lestari Dewi, M.Kes.',
    nip: '197410041999032005',
    jabatan: 'Kepala Dinas',
    golongan: 'IV/c',
  },
  {
    pd: 'Dinas Kesehatan',
    nama: 'Agus Hermawan, S.K.M.',
    nip: '197912282005011006',
    jabatan: 'Sekretaris Dinas',
    golongan: 'IV/a',
  },
  {
    pd: 'Dinas Kesehatan',
    nama: 'Ns. Fitri Handayani, S.Kep.',
    nip: '198607142010012012',
    jabatan: 'Kepala Seksi Pelayanan Kesehatan',
    golongan: 'III/d',
  },
  {
    pd: 'Dinas Kesehatan',
    nama: 'Dedi Kurniawan, A.Md.',
    nip: '199003252015031002',
    jabatan: 'Pengelola Barang Milik Daerah',
    golongan: 'II/d',
  },
  {
    pd: 'Dinas Kesehatan',
    nama: 'Siti Nurhaliza, S.Farm., Apt.',
    nip: '199205192019032008',
    jabatan: 'Apoteker Ahli Pertama',
    golongan: 'III/a',
  },
  // Dinas PUPR
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nama: 'Ir. Bambang Sutrisno, M.T.',
    nip: '197001201996031001',
    jabatan: 'Kepala Dinas',
    golongan: 'IV/d',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nama: 'Hendra Gunawan, S.T., M.T.',
    nip: '197807092003121003',
    jabatan: 'Kepala Bidang Bina Marga',
    golongan: 'IV/a',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nama: 'Yuliana Pratiwi, S.T.',
    nip: '198409302008012009',
    jabatan: 'Kepala Seksi Tata Ruang',
    golongan: 'III/c',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nama: 'Rudi Hartono, S.T.',
    nip: '199108112017031005',
    jabatan: 'Teknik Jalan dan Jembatan Ahli Pertama',
    golongan: 'III/a',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nama: 'Slamet Riyadi',
    nip: '198207262010011004',
    jabatan: 'Operator Alat Berat',
    golongan: 'II/b',
  },
]

interface SeedKendaraan {
  nomor_polisi: string
  merek: string
  tipe_model: string
  tahun_produksi: number
  warna: string
  kondisi: KondisiKendaraan
  pd: NamaPD
  /** NIP penanggung jawab; `null` = belum ada penanggung jawab. */
  nip: string | null
  keterangan?: string
}

const KENDARAAN: SeedKendaraan[] = [
  // Dinas Pendidikan
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 1001 PDA',
    merek: 'Toyota',
    tipe_model: 'Innova Reborn 2.4 G',
    tahun_produksi: 2021,
    warna: 'Hitam',
    kondisi: 'baik',
    nip: '197203151998031004',
    keterangan: 'Kendaraan jabatan Kepala Dinas',
  },
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 1002 PDA',
    merek: 'Toyota',
    tipe_model: 'Avanza 1.3 G',
    tahun_produksi: 2018,
    warna: 'Silver',
    kondisi: 'baik',
    nip: '197608222001122002',
  },
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 1003 PDA',
    merek: 'Mitsubishi',
    tipe_model: 'Xpander Ultimate',
    tahun_produksi: 2020,
    warna: 'Putih',
    kondisi: 'rusak_ringan',
    nip: '198105102006041011',
    keterangan: 'AC kurang dingin, perlu servis',
  },
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 3104 PDA',
    merek: 'Honda',
    tipe_model: 'Vario 125 CBS',
    tahun_produksi: 2019,
    warna: 'Merah',
    kondisi: 'baik',
    nip: '198911032014032003',
  },
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 3105 PDA',
    merek: 'Yamaha',
    tipe_model: 'NMAX 155',
    tahun_produksi: 2016,
    warna: 'Hitam',
    kondisi: 'rusak_berat',
    nip: null,
    keterangan: 'Mesin turun, menunggu usulan penghapusan',
  },
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 1006 PDA',
    merek: 'Isuzu',
    tipe_model: 'Elf NLR 55 BLX (Minibus)',
    tahun_produksi: 2015,
    warna: 'Putih',
    kondisi: 'rusak_ringan',
    nip: '198502172009011007',
  },
  {
    pd: 'Dinas Pendidikan',
    nomor_polisi: 'B 1007 PDA',
    merek: 'Suzuki',
    tipe_model: 'APV Arena GX',
    tahun_produksi: 2013,
    warna: 'Biru',
    kondisi: 'rusak_berat',
    nip: null,
  },
  // Dinas Kesehatan
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 1011 KSA',
    merek: 'Toyota',
    tipe_model: 'Fortuner 2.4 VRZ',
    tahun_produksi: 2022,
    warna: 'Hitam',
    kondisi: 'baik',
    nip: '197410041999032005',
    keterangan: 'Kendaraan jabatan Kepala Dinas',
  },
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 1012 KSA',
    merek: 'Toyota',
    tipe_model: 'Hiace Commuter (Ambulans)',
    tahun_produksi: 2019,
    warna: 'Putih',
    kondisi: 'baik',
    nip: '198607142010012012',
    keterangan: 'Ambulans operasional',
  },
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 1013 KSA',
    merek: 'Toyota',
    tipe_model: 'Avanza 1.5 Veloz',
    tahun_produksi: 2017,
    warna: 'Abu-abu',
    kondisi: 'rusak_ringan',
    nip: '197912282005011006',
  },
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 3114 KSA',
    merek: 'Honda',
    tipe_model: 'Beat CBS',
    tahun_produksi: 2020,
    warna: 'Putih',
    kondisi: 'baik',
    nip: '199003252015031002',
  },
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 3115 KSA',
    merek: 'Honda',
    tipe_model: 'Vario 150',
    tahun_produksi: 2018,
    warna: 'Hitam',
    kondisi: 'baik',
    nip: null,
  },
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 1016 KSA',
    merek: 'Daihatsu',
    tipe_model: 'Gran Max Blind Van',
    tahun_produksi: 2016,
    warna: 'Putih',
    kondisi: 'rusak_berat',
    nip: null,
    keterangan: 'Kerusakan pada transmisi',
  },
  {
    pd: 'Dinas Kesehatan',
    nomor_polisi: 'B 3117 KSA',
    merek: 'Yamaha',
    tipe_model: 'NMAX 155 Connected',
    tahun_produksi: 2023,
    warna: 'Biru',
    kondisi: 'baik',
    nip: '199205192019032008',
  },
  // Dinas PUPR
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nomor_polisi: 'B 1021 PUA',
    merek: 'Mitsubishi',
    tipe_model: 'Pajero Sport Dakar 4x2',
    tahun_produksi: 2021,
    warna: 'Putih',
    kondisi: 'baik',
    nip: '197001201996031001',
    keterangan: 'Kendaraan jabatan Kepala Dinas',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nomor_polisi: 'B 1022 PUA',
    merek: 'Toyota',
    tipe_model: 'Hilux Double Cabin 2.4 E',
    tahun_produksi: 2020,
    warna: 'Silver',
    kondisi: 'baik',
    nip: '197807092003121003',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nomor_polisi: 'B 9023 PUA',
    merek: 'Isuzu',
    tipe_model: 'Elf NMR 71 (Dump Truck)',
    tahun_produksi: 2014,
    warna: 'Kuning',
    kondisi: 'rusak_ringan',
    nip: '198207262010011004',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nomor_polisi: 'B 1024 PUA',
    merek: 'Toyota',
    tipe_model: 'Innova 2.0 G',
    tahun_produksi: 2012,
    warna: 'Hitam',
    kondisi: 'rusak_berat',
    nip: null,
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nomor_polisi: 'B 3125 PUA',
    merek: 'Honda',
    tipe_model: 'CRF 150L',
    tahun_produksi: 2022,
    warna: 'Merah',
    kondisi: 'baik',
    nip: '199108112017031005',
    keterangan: 'Untuk survei lapangan',
  },
  {
    pd: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    nomor_polisi: 'B 1026 PUA',
    merek: 'Suzuki',
    tipe_model: 'Carry Pick Up 1.5',
    tahun_produksi: 2019,
    warna: 'Hitam',
    kondisi: 'rusak_ringan',
    nip: '198409302008012009',
  },
]

export async function seed(): Promise<{
  perangkat_daerah: number
  pegawai: number
  kendaraan: number
}> {
  return db.transaction(async (tx) => {
    // 1. Perangkat daerah (unik berdasarkan lower(nama); ON CONFLICT tanpa target menangkap index ekspresi)
    await tx
      .insert(perangkatDaerah)
      .values(PERANGKAT_DAERAH.map((nama) => ({ nama })))
      .onConflictDoNothing()

    const pdRows = await tx
      .select({ id: perangkatDaerah.id, nama: perangkatDaerah.nama })
      .from(perangkatDaerah)
      .where(sql`lower(${perangkatDaerah.nama}) in ${PERANGKAT_DAERAH.map((n) => n.toLowerCase())}`)
    const pdId = new Map(pdRows.map((r) => [r.nama.toLowerCase(), r.id]))
    const getPd = (nama: NamaPD) => {
      const id = pdId.get(nama.toLowerCase())
      if (!id) throw new Error(`Perangkat daerah "${nama}" tidak ditemukan`)
      return id
    }

    // 2. Pegawai (unik berdasarkan NIP)
    await tx
      .insert(pegawai)
      .values(PEGAWAI.map(({ pd, ...p }) => ({ ...p, perangkat_daerah_id: getPd(pd) })))
      .onConflictDoNothing({ target: pegawai.nip })

    const pegawaiRows = await tx
      .select({
        id: pegawai.id,
        nip: pegawai.nip,
        perangkat_daerah_id: pegawai.perangkat_daerah_id,
      })
      .from(pegawai)
      .where(sql`${pegawai.nip} in ${PEGAWAI.map((p) => p.nip)}`)
    const pegawaiByNip = new Map(pegawaiRows.map((r) => [r.nip, r]))

    // 3. Kendaraan (unik berdasarkan nomor polisi). Penanggung jawab hanya diisi
    //    bila pegawai berada di perangkat daerah yang sama (menjaga aturan bisnis).
    await tx
      .insert(kendaraanDinas)
      .values(
        KENDARAAN.map(({ pd, nip, ...k }) => {
          const perangkat_daerah_id = getPd(pd)
          const pj = nip ? pegawaiByNip.get(nip) : undefined
          return {
            ...k,
            perangkat_daerah_id,
            pegawai_id: pj && pj.perangkat_daerah_id === perangkat_daerah_id ? pj.id : null,
          }
        }),
      )
      .onConflictDoNothing({ target: kendaraanDinas.nomor_polisi })

    const [counts] = await tx.execute<{ pd: number; pg: number; kd: number }>(sql`
      select
        (select count(*)::int from ${perangkatDaerah}) as pd,
        (select count(*)::int from ${pegawai}) as pg,
        (select count(*)::int from ${kendaraanDinas}) as kd
    `)
    return {
      perangkat_daerah: counts?.pd ?? 0,
      pegawai: counts?.pg ?? 0,
      kendaraan: counts?.kd ?? 0,
    }
  })
}

if (import.meta.main) {
  try {
    const total = await seed()
    console.log('✔ Seeder selesai. Total data saat ini:', total)
  } catch (error) {
    console.error('✘ Seeder gagal:', error)
    process.exitCode = 1
  } finally {
    await closeDb()
  }
}
