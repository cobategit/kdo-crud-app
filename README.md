# Ujian Praktek Junior Programmer - BPAD

## SIM-KDO — Aplikasi Pengelolaan Kendaraan Dinas Operasional

Aplikasi web untuk pendataan **kendaraan dinas operasional (KDO)** milik perangkat daerah:

1. Mengetahui **kondisi** setiap kendaraan (Baik, Rusak Ringan, Rusak Berat).
2. Mengetahui **perangkat daerah** pemilik/pengguna kendaraan.
3. Mencatat **pegawai penanggung jawab** penggunaan kendaraan.

> Status pengembangan: **Fase 0 (Setup) selesai.** Modul CRUD dikerjakan bertahap pada fase 1–5
> (lihat [Roadmap](#roadmap)).

---

## Tech Stack

| Lapisan                   | Teknologi                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Runtime & package manager | Bun 1.4 (workspaces)                                                                                                        |
| Backend                   | Elysia 1.4, TypeScript strict, Drizzle ORM + drizzle-kit, postgres.js, TypeBox (`t`), `@elysiajs/cors`, `@elysiajs/openapi` |
| Frontend                  | Vue 3.5 (`<script setup>`), Vite 8, Pinia 3, Vue Router 4, Tailwind CSS 4, VeeValidate + Zod, Axios                         |
| Database                  | PostgreSQL 17 (kompatibel 15+), ekstensi `pg_trgm`                                                                          |
| Testing                   | `bun test` (backend, DB test terpisah), Vitest + Vue Test Utils (frontend)                                                  |
| Lint/format               | Biome                                                                                                                       |
| Infrastruktur             | Docker multi-stage, docker-compose (postgres, api, web)                                                                     |

---

## Menjalankan Secara Lokal

Prasyarat: **Bun ≥ 1.4** dan **Docker** (untuk PostgreSQL).

```bash
cp .env.example .env
```

```bash
bun install
```

```bash
docker compose up -d postgres
```

```bash
bun run db:migrate
```

```bash
bun run db:seed
```

```bash
bun run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1
- Dokumentasi OpenAPI: http://localhost:3000/docs

Menjalankan backend/frontend secara terpisah: `bun run dev:api` dan `bun run dev:web`.

### Menjalankan seluruhnya via Docker

```bash
docker compose up -d --build
```

Container `api` otomatis menjalankan migrasi lalu seeder (idempoten, dapat dimatikan dengan
`RUN_SEED=false`). Frontend tersedia di http://localhost:5173 dan API di http://localhost:3000.

### Perintah

| Perintah (dari root)              | Fungsi                                              |
| --------------------------------- | --------------------------------------------------- |
| `bun run dev`                     | Menjalankan API (watch) & frontend (Vite) bersamaan |
| `bun run build`                   | Type-check & build backend + frontend               |
| `bun run start`                   | Menjalankan hasil build backend                     |
| `bun run test`                    | `bun test` backend + Vitest frontend                |
| `bun run db:generate`             | Membuat file migrasi dari perubahan `schema.ts`     |
| `bun run db:migrate`              | Menjalankan migrasi                                 |
| `bun run db:seed`                 | Mengisi data contoh (idempoten)                     |
| `bun run lint` / `bun run format` | Biome check / perbaikan otomatis                    |

### Testing

Test backend memakai database **terpisah** (`TEST_DATABASE_URL`, default `kdo_test`) yang dibuat
otomatis oleh `docker/postgres/init.sql` saat volume Postgres pertama kali dibuat. Preload test
menjalankan migrasi dan menolak berjalan bila nama database tidak mengandung `test`.

Jika volume Postgres sudah ada sebelum file init ditambahkan, buat manual:

```bash
docker compose exec postgres psql -U kdo -c "CREATE DATABASE kdo_test"
```

---

## Arsitektur

```
.
├── backend/                 # Elysia API
│   ├── src/
│   │   ├── index.ts         # bootstrap: listen + graceful shutdown
│   │   ├── app.ts           # createApp(): plugin, CORS, OpenAPI, error handler, router /api/v1
│   │   ├── config/env.ts    # baca & validasi env
│   │   ├── db/              # client, schema Drizzle, migrations/, migrate.ts, seed.ts
│   │   ├── lib/             # errors, error-handler, response, pagination, nomor-polisi
│   │   └── modules/         # per entitas: routes → service → repository (+ model.ts skema t)
│   └── tests/               # bun test (setup.ts memakai DB test terpisah)
├── frontend/                # Vue 3 SPA
│   └── src/
│       ├── api/             # instance axios terpusat + modul API per entitas
│       ├── stores/          # Pinia setup store per entitas
│       ├── views/ components/ composables/ schemas/ router/ types/ utils/
├── docker/postgres/init.sql # membuat database test
├── docker-compose.yml
└── .env.example
```

**Backend:** `routes` (validasi HTTP via TypeBox) → `service` (aturan bisnis, transaksi) →
`repository` (query Drizzle). Error domain (`NotFoundError`, `DuplicateError`,
`RelationInUseError`, `InvalidPenanggungJawabError`, …) ditangani terpusat di `onError`, termasuk
pemetaan error PostgreSQL (`23505` → `DATA_DUPLIKAT`). Stack trace tidak pernah dikirim ke client.

**Frontend:** komponen → store Pinia → modul `api/` → instance Axios. Interceptor Axios
menormalisasi error menjadi `ApiError` (dengan `fieldErrors` untuk ditampilkan per field di form).

### Format Response

```json
{ "success": true, "data": {}, "meta": { "page": 1, "per_page": 10, "total": 57, "total_pages": 6 } }
{ "success": false, "error": { "code": "VALIDASI_GAGAL", "message": "Data tidak valid", "details": [{ "field": "nip", "message": "NIP harus 18 digit angka" }] } }
```

| Kode                           | HTTP |
| ------------------------------ | ---- |
| `VALIDASI_GAGAL`               | 422  |
| `TIDAK_DITEMUKAN`              | 404  |
| `DATA_DUPLIKAT`                | 409  |
| `RELASI_MASIH_DIGUNAKAN`       | 409  |
| `PENANGGUNG_JAWAB_TIDAK_VALID` | 422  |
| `KESALAHAN_SERVER`             | 500  |

---

## Diagram Relasi Entitas (ERD)

```mermaid
erDiagram
    perangkat_daerah ||--o{ pegawai : "menaungi"
    perangkat_daerah ||--o{ kendaraan_dinas : "memiliki"
    pegawai |o--o{ kendaraan_dinas : "penanggung jawab"

    perangkat_daerah {
        uuid id PK
        varchar(150) nama "unik (lower)"
        timestamptz created_at
        timestamptz updated_at
    }
    pegawai {
        uuid id PK
        varchar(150) nama
        char(18) nip "unik, 18 digit"
        varchar(150) jabatan
        varchar(5) golongan "I/a s.d. IV/e"
        uuid perangkat_daerah_id FK
        timestamptz created_at
        timestamptz updated_at
    }
    kendaraan_dinas {
        uuid id PK
        varchar(12) nomor_polisi "unik"
        varchar(50) merek
        varchar(100) tipe_model
        smallint tahun_produksi "1980..tahun berjalan"
        varchar(30) warna
        kondisi_kendaraan kondisi "baik | rusak_ringan | rusak_berat"
        uuid perangkat_daerah_id FK
        uuid pegawai_id FK "opsional"
        text keterangan
        timestamptz created_at
        timestamptz updated_at
    }
```

Semua foreign key memakai `ON DELETE RESTRICT`. Index: seluruh FK, `kendaraan_dinas(kondisi)`,
`pegawai(nama)`, unique `lower(perangkat_daerah.nama)`, serta index GIN trigram untuk pencarian
`nama`, `nomor_polisi`, `merek`, dan `tipe_model`.

---

## Endpoint API (prefix `/api/v1`)

| Method         | Endpoint                 | Status    |
| -------------- | ------------------------ | --------- |
| GET            | `/health`                | ✅ Fase 0 |
| GET/POST       | `/perangkat-daerah`      | Fase 1    |
| GET/PUT/DELETE | `/perangkat-daerah/:id`  | Fase 1    |
| GET/POST       | `/pegawai`               | Fase 2    |
| GET/PUT/DELETE | `/pegawai/:id`           | Fase 2    |
| GET/POST       | `/kendaraan`             | Fase 3    |
| GET/PUT/DELETE | `/kendaraan/:id`         | Fase 3    |
| PATCH          | `/kendaraan/:id/kondisi` | Fase 3    |
| GET            | `/dashboard/ringkasan`   | Fase 4    |

---

## Aturan Bisnis

- Penanggung jawab kendaraan **harus** pegawai dari perangkat daerah yang sama
  (`PENANGGUNG_JAWAB_TIDAK_VALID`).
- Mengubah perangkat daerah kendaraan dengan penanggung jawab yang tidak lagi sesuai ditolak.
- Hapus perangkat daerah ditolak (409 `RELASI_MASIH_DIGUNAKAN`) bila masih memiliki pegawai atau
  kendaraan; pesan menyebutkan jumlahnya.
- Hapus pegawai ditolak (409) bila masih menjadi penanggung jawab; pesan menyebutkan nomor polisi.
- Pindah perangkat daerah pegawai ditolak bila masih menjadi penanggung jawab kendaraan di perangkat
  daerah lama.
- Duplikasi `nomor_polisi`, `nip`, atau `nama` perangkat daerah → 409 `DATA_DUPLIKAT` + nama field.

---

## Asumsi & Keputusan

- **Monorepo di root repositori** (bukan subfolder `kdo-app/`), karena repositori ini khusus untuk
  aplikasi tersebut.
- **Versi stabil** dipilih daripada rilis RC/next: Elysia 1.4 (bukan 2.0 RC), Vue Router 4 (sesuai
  spesifikasi), Pinia 3, TypeScript 5.9 (TypeScript 7 belum didukung `vue-tsc`), Zod 3.25 (peer
  dependency `@vee-validate/zod`).
- **Pola nomor polisi**: spesifikasi menulis `^[A-Z]{1,2} \d{1,4} [A-Z]{0,3}$`, yang mewajibkan spasi
  di akhir bila seri huruf kosong. Diterapkan sebagai `^[A-Z]{1,2} \d{1,4}( [A-Z]{1,3})?$` sehingga
  `B 1234` valid tanpa spasi di akhir. Input seperti `b1234abc` dinormalisasi menjadi `B 1234 ABC`.
- **Tahun produksi**: CHECK constraint database membatasi `1980..2100` (constraint harus
  deterministik), sedangkan batas atas tepat "tahun berjalan" (zona Asia/Jakarta) divalidasi di API.
- **`updated_at`** diperbarui oleh Drizzle (`$onUpdate`) dan trigger database sebagai pengaman kedua.
- **`app.ts` terpisah dari `index.ts`** agar aplikasi bisa diuji lewat `app.handle()` tanpa membuka
  port.
- File `.env` tunggal di root dipakai backend (`--env-file=../.env`) dan frontend (`envDir`).
- Lint & format memakai **Biome** (satu alat untuk TS; file `.vue` dicek `vue-tsc`).

---

## Roadmap

- [x] **Fase 0** — Setup monorepo, docker-compose, Elysia + Drizzle, skema & migrasi, seeder, Vue +
  Pinia + Router + Tailwind, layout dasar
- [ ] **Fase 1** — Perangkat Daerah (API CRUD + test, store, halaman)
- [ ] **Fase 2** — Pegawai (validasi NIP/golongan)
- [ ] **Fase 3** — Kendaraan Dinas (aturan penanggung jawab, `PATCH kondisi`)
- [ ] **Fase 4** — Dashboard ringkasan
- [ ] **Fase 5** — Penyempurnaan UX, dokumentasi
