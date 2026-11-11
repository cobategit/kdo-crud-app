export type ErrorCode =
  | 'VALIDASI_GAGAL'
  | 'TIDAK_DITEMUKAN'
  | 'DATA_DUPLIKAT'
  | 'RELASI_MASIH_DIGUNAKAN'
  | 'PENANGGUNG_JAWAB_TIDAK_VALID'
  | 'KESALAHAN_SERVER'

export interface ErrorDetail {
  field: string
  message: string
}

/** Kelas dasar error domain. Ditangkap terpusat oleh `onError` di bootstrap Elysia. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Data tidak valid', details?: ErrorDetail[]) {
    super(422, 'VALIDASI_GAGAL', message, details)
  }
}

export class NotFoundError extends AppError {
  constructor(entitas: string) {
    super(404, 'TIDAK_DITEMUKAN', `${entitas} tidak ditemukan`)
  }
}

export class DuplicateError extends AppError {
  constructor(field: string, message: string) {
    super(409, 'DATA_DUPLIKAT', message, [{ field, message }])
  }
}

export class RelationInUseError extends AppError {
  constructor(message: string) {
    super(409, 'RELASI_MASIH_DIGUNAKAN', message)
  }
}

export class InvalidPenanggungJawabError extends AppError {
  constructor(message = 'Penanggung jawab harus berasal dari perangkat daerah yang sama') {
    super(422, 'PENANGGUNG_JAWAB_TIDAK_VALID', message, [{ field: 'pegawai_id', message }])
  }
}

/** Pemetaan nama unique constraint PostgreSQL → field & pesan yang ramah pengguna. */
const UNIQUE_CONSTRAINTS: Record<string, { field: string; message: string }> = {
  perangkat_daerah_nama_lower_uq: {
    field: 'nama',
    message: 'Nama perangkat daerah sudah terdaftar',
  },
  pegawai_nip_uq: { field: 'nip', message: 'NIP sudah terdaftar' },
  kendaraan_dinas_nomor_polisi_uq: {
    field: 'nomor_polisi',
    message: 'Nomor polisi sudah terdaftar',
  },
}

interface PgErrorLike {
  code?: string
  constraint_name?: string
  constraint?: string
}

function findPgError(error: unknown): PgErrorLike | undefined {
  // Drizzle membungkus error driver di `cause`; telusuri rantainya.
  let current: unknown = error
  for (let i = 0; i < 5 && current && typeof current === 'object'; i++) {
    const candidate = current as PgErrorLike & { cause?: unknown }
    if (typeof candidate.code === 'string' && /^[0-9A-Z]{5}$/.test(candidate.code)) {
      return candidate
    }
    current = candidate.cause
  }
  return undefined
}

/**
 * Mengubah error PostgreSQL yang dikenal menjadi error domain.
 * Mengembalikan `undefined` bila error tidak dikenali (akan menjadi 500).
 */
export function mapDatabaseError(error: unknown): AppError | undefined {
  const pg = findPgError(error)
  if (!pg) return undefined
  const constraint = pg.constraint_name ?? pg.constraint ?? ''
  switch (pg.code) {
    case '23505': {
      const known = UNIQUE_CONSTRAINTS[constraint]
      return known
        ? new DuplicateError(known.field, known.message)
        : new DuplicateError('unknown', 'Data sudah terdaftar')
    }
    case '23503':
      return new RelationInUseError('Data masih digunakan oleh data lain')
    case '23514':
      return new ValidationError('Data tidak memenuhi aturan validasi', [
        { field: constraint, message: 'Nilai tidak valid' },
      ])
    case '22P02':
      return new ValidationError('Format data tidak valid')
    default:
      return undefined
  }
}
