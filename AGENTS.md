- intruksi 1
  buatkan prompt untuk sebuah aplikasi mengelola data Kendaraan Dinas Operasional (KDO), yang dimana aplikasi ini bertujuan untuk membantu proses pendataan kendaraan dinas, guna. mengetahui kondisi kendaraan, serta mencatat pegawai yang bertanggung jawab atas pengunaannya,
  dalam pembuatan aplikasi, terdapat tiga entitas utama yang harus dikelola

1. kendaraan dinas operasional: nomor_polisi, merek, tipe atau model, tahun produksi, warna kendaraan, kondisi atau status kendaraan (baik, rusak ringan, rusak berat)
2. pegawai: nama, nip, jabatan, golongan
3. perangkat daerah (data instansi yang menggunakan atau memiliki kendaraan dinas): dinas pendidikan, dinas kesehatan, dinas pekerjaan umum dan penataan ruang

fitur nya itu meliputi CRUD (Cread, Read, Update, Delete) pada setiap entitas
untuk stack nya itu,
backend: bunjs + elysia + pgsql
frontend: vue3 + pinia
database: postgresql

- instruksi 2
  Kamu adalah Senior Full-Stack Engineer yang berpengalaman membangun aplikasi administrasi pemerintahan yang rapi dan siap dipakai. Bangun aplikasi web Pengelolaan Kendaraan Dinas Operasional (KDO) untuk pemerintah daerah.
  Tulis kode yang bersih, idiomatis, bertipe kuat (TypeScript end-to-end), teruji, dan siap di-deploy. Jangan membuat placeholder kosong ("TODO: implement") untuk fitur inti.

1. Konteks & Tujuan
   Aplikasi ini membantu proses pendataan kendaraan dinas operasional milik perangkat daerah, dengan tujuan:
1. Mengetahui kondisi setiap kendaraan dinas (baik, rusak ringan, rusak berat).
1. Mengetahui perangkat daerah pemilik/pengguna kendaraan.
1. Mencatat pegawai yang bertanggung jawab atas penggunaan kendaraan.
   Ketentuan umum:

- Bahasa UI Bahasa Indonesia, zona waktu Asia/Jakarta.
- Penamaan tabel, kolom, dan field API memakai snake_case Bahasa Indonesia sesuai istilah domain (mis. nomor_polisi, perangkat_daerah_id).
- Fitur inti: CRUD (Create, Read, Update, Delete) lengkap untuk setiap entitas.

2. Entitas & Relasi
   2.1 Perangkat Daerah
   Data instansi yang memiliki/menggunakan kendaraan dinas.
   FieldTipeAturanidUUIDPKnamaVARCHAR(150)wajib, unik (case-insensitive)created_at, updated_atTIMESTAMPTZotomatisData awal (seeder) wajib berisi:

- Dinas Pendidikan
- Dinas Kesehatan
- Dinas Pekerjaan Umum dan Penataan Ruang
  2.2 Pegawai
  FieldTipeAturanidUUIDPKnamaVARCHAR(150)wajibnipCHAR(18)wajib, unik, tepat 18 digit angkajabatanVARCHAR(150)wajibgolonganVARCHAR(5)wajib, salah satu dari I/a s.d. IV/e (CHECK constraint)perangkat_daerah_idUUIDwajib, FK → perangkat_daerah (tempat pegawai bertugas)created_at, updated_atTIMESTAMPTZotomatisDaftar golongan yang valid: I/a, I/b, I/c, I/d, II/a, II/b, II/c, II/d, III/a, III/b, III/c, III/d, IV/a, IV/b, IV/c, IV/d, IV/e.
  2.3 Kendaraan Dinas Operasional
  FieldTipeAturanidUUIDPKnomor_polisiVARCHAR(12)wajib, unik; dinormalisasi ke huruf besar dengan satu spasi antar bagian (mis. B 1234 ABC); validasi pola ^[A-Z]{1,2} \d{1,4} [A-Z]{0,3}$merekVARCHAR(50)wajib (mis. Toyota, Honda)tipe_modelVARCHAR(100)wajib (mis. Innova Reborn 2.4 G)tahun_produksiSMALLINTwajib, antara 1980 dan tahun berjalanwarnaVARCHAR(30)wajibkondisiENUM kondisi_kendaraanwajib: baik, rusak_ringan, rusak_berat (label UI: Baik, Rusak Ringan, Rusak Berat)perangkat_daerah_idUUIDwajib, FK → perangkat_daerahpegawai_idUUIDopsional, FK → pegawai (penanggung jawab penggunaan)keteranganTEXTopsionalcreated_at, updated_atTIMESTAMPTZotomatis2.4 Relasi & Aturan Bisnis
  perangkat_daerah 1 ──< N pegawai
  perangkat_daerah 1 ──< N kendaraan_dinas
  pegawai 1 ──< N kendaraan_dinas (sebagai penanggung jawab, opsional)
- Penanggung jawab harus berasal dari perangkat daerah yang sama dengan kendaraan. Validasi di service layer; tolak dengan error PENANGGUNG_JAWAB_TIDAK_VALID bila berbeda.
- Jika perangkat daerah kendaraan diubah, pegawai_id yang tidak lagi sesuai wajib dikosongkan atau diganti (tolak request yang tidak konsisten).
- Hapus perangkat daerah ditolak (HTTP 409, RELASI_MASIH_DIGUNAKAN) bila masih memiliki pegawai atau kendaraan. Tampilkan jumlahnya di pesan error.
- Hapus pegawai ditolak (409) bila masih menjadi penanggung jawab kendaraan; pesan error menyebutkan nomor polisi kendaraan terkait.
- Pindah perangkat daerah pegawai ditolak bila pegawai masih menjadi penanggung jawab kendaraan di perangkat daerah lama.
- Gunakan ON DELETE RESTRICT di level database sebagai pengaman kedua.
- Duplikasi nomor_polisi, nip, atau nama perangkat daerah → HTTP 409 DATA_DUPLIKAT dengan nama field yang bentrok (tangkap unique violation PostgreSQL kode 23505).

3. Tech Stack (WAJIB)
   Backend

- Bun (versi stabil terbaru) sebagai runtime & package manager
- Elysia sebagai HTTP framework
- TypeScript (strict mode)
- Drizzle ORM + drizzle-kit untuk schema, query, dan migrasi PostgreSQL (driver: postgres / postgres.js, atau Bun.sql)
- Validasi request memakai skema bawaan Elysia (t / TypeBox) di setiap route — body, params, dan query
- @elysiajs/cors untuk CORS
- @elysiajs/openapi (atau @elysiajs/swagger bila versi Elysia lebih lama) untuk dokumentasi API di /docs
- bun test untuk unit & integration test
  Frontend
- Vue 3 (Composition API, <script setup>) + Vite + TypeScript
- Pinia (setup store) untuk state management
- Vue Router 4
- Tailwind CSS untuk styling (boleh memakai PrimeVue/Naive UI bila mempercepat pembuatan tabel, dialog, dan form)
- VeeValidate + Zod untuk validasi form
- Axios dengan instance terpusat (base URL dari env, interceptor untuk normalisasi error)
- Opsional: Eden Treaty (@elysiajs/eden) untuk type-safe API client end-to-end bila memakai monorepo
- Vitest + Vue Test Utils untuk test komponen/store penting
  Database
- PostgreSQL 15+
- Primary key UUID (gen_random_uuid()), semua timestamp TIMESTAMPTZ
- ENUM untuk kondisi, CHECK constraint untuk golongan, nip, dan tahun_produksi
- Index: semua foreign key, kendaraan_dinas(kondisi), pegawai(nama), unique index lower(nama) di perangkat_daerah
- Pertimbangkan ekstensi pg_trgm + index GIN untuk pencarian teks (nama, nomor_polisi, merek)
  Infrastruktur
- Docker + docker-compose (postgres, api, web)
- Script package.json: dev, build, start, test, db:generate, db:migrate, db:seed, lint
- .env.example lengkap (DATABASE_URL, PORT, CORS_ORIGIN, VITE_API_URL)

4. Fitur Fungsional
   4.1 CRUD Perangkat Daerah

- Daftar (tabel) dengan pencarian nama, pagination, serta kolom jumlah pegawai dan jumlah kendaraan
- Tambah, ubah, hapus (dengan dialog konfirmasi; tampilkan pesan jelas jika ditolak karena relasi)
- Halaman detail: info perangkat daerah + daftar pegawai + daftar kendaraan miliknya
  4.2 CRUD Pegawai
- Daftar dengan pencarian (nama/NIP), filter perangkat daerah & golongan, sort (nama, golongan), pagination
- Form tambah/ubah: input NIP dengan validasi 18 digit, dropdown golongan, dropdown perangkat daerah
- Halaman detail: data pegawai + daftar kendaraan yang menjadi tanggung jawabnya
- Hapus dengan konfirmasi
  4.3 CRUD Kendaraan Dinas
- Daftar dengan pencarian (nomor polisi/merek/tipe), filter kondisi, perangkat daerah, tahun produksi, dan "tanpa penanggung jawab"; sort; pagination
- Kondisi ditampilkan sebagai badge berwarna (Baik = hijau, Rusak Ringan = kuning, Rusak Berat = merah)
- Form tambah/ubah:
  - Input nomor polisi dinormalisasi otomatis ke huruf besar
  - Pilih perangkat daerah → dropdown penanggung jawab hanya menampilkan pegawai dari perangkat daerah tersebut (searchable, tampilkan nama + NIP + jabatan)
  - Saat perangkat daerah diganti, kosongkan pilihan penanggung jawab
- Halaman detail: seluruh data kendaraan + perangkat daerah + profil singkat penanggung jawab
- Aksi cepat ubah kondisi dari halaman daftar/detail (endpoint PATCH)
- Hapus dengan konfirmasi
  4.4 Dashboard Ringkas
  Untuk menjawab tujuan "mengetahui kondisi kendaraan":
- Kartu ringkasan: total kendaraan, jumlah Baik / Rusak Ringan / Rusak Berat, total pegawai, total perangkat daerah, jumlah kendaraan tanpa penanggung jawab
- Tabel rekap kondisi kendaraan per perangkat daerah
- Klik angka di dashboard → membuka daftar kendaraan dengan filter terkait
  4.5 UX Umum
- Layout: sidebar (Dashboard, Kendaraan, Pegawai, Perangkat Daerah) yang berubah menjadi drawer di layar kecil; responsif
- Loading skeleton, empty state, toast sukses/gagal, dialog konfirmasi hapus
- Pesan error validasi dari backend ditampilkan per field di form
- Filter, pencarian, dan halaman tersimpan di query string URL agar bisa di-refresh/dibagikan
- Pencarian dengan debounce (±300 ms)

5. Desain API (REST, prefix /api/v1)
   Format response konsisten:
   { "success": true, "data": {}, "meta": { "page": 1, "per_page": 10, "total": 57 } }
   { "success": false, "error": { "code": "VALIDASI_GAGAL", "message": "Data tidak valid", "details": [{ "field": "nip", "message": "NIP harus 18 digit angka" }] } }
   Kode error minimal: VALIDASI_GAGAL (422), TIDAK_DITEMUKAN (404), DATA_DUPLIKAT (409), RELASI_MASIH_DIGUNAKAN (409), PENANGGUNG_JAWAB_TIDAK_VALID (422), KESALAHAN_SERVER (500).
   Query list standar: page, per_page (maks 100), search, sort (mis. nama, -tahun_produksi), plus filter khusus entitas.
   MethodEndpointKeteranganGET/perangkat-daerahlist + jumlah pegawai & kendaraanGET/perangkat-daerah/:iddetailPOST/perangkat-daerahtambahPUT/perangkat-daerah/:idubahDELETE/perangkat-daerah/:idhapus (409 bila masih dipakai)GET/pegawailist; filter perangkat_daerah_id, golonganGET/pegawai/:iddetail + kendaraan yang dipegangPOST/pegawaitambahPUT/pegawai/:idubahDELETE/pegawai/:idhapus (409 bila masih penanggung jawab)GET/kendaraanlist; filter kondisi, perangkat_daerah_id, tahun_produksi, tanpa_penanggung_jawabGET/kendaraan/:iddetail + perangkat daerah + penanggung jawabPOST/kendaraantambahPUT/kendaraan/:idubahPATCH/kendaraan/:id/kondisiubah kondisi sajaDELETE/kendaraan/:idhapusGET/dashboard/ringkasanangka ringkasan + rekap kondisi per perangkat daerahGET/healthhealth check (termasuk cek koneksi DB)Ketentuan:

- ID di path divalidasi sebagai UUID (format salah → 422, bukan 500)
- Response detail menyertakan relasi (perangkat_daerah: { id, nama }, penanggung_jawab: { id, nama, nip, jabatan })
- Query dashboard memakai agregasi SQL (COUNT ... FILTER (WHERE ...), GROUP BY), bukan menghitung di JavaScript
- Error ditangani terpusat lewat onError Elysia + kelas error domain (NotFoundError, ConflictError, dst.)

6. Arsitektur & Struktur Folder
   Monorepo dengan Bun workspaces:
   kdo-app/
   ├── backend/
   │ ├── src/
   │ │ ├── index.ts # bootstrap Elysia, plugin, error handler, listen
   │ │ ├── config/env.ts # baca & validasi env
   │ │ ├── db/
   │ │ │ ├── client.ts
   │ │ │ ├── schema.ts # tabel, enum, relasi Drizzle
   │ │ │ ├── migrations/
   │ │ │ └── seed.ts
   │ │ ├── lib/ # response helper, pagination, errors, normalisasi nopol
   │ │ └── modules/
   │ │ ├── perangkat-daerah/ # routes.ts, service.ts, repository.ts, model.ts (skema t)
   │ │ ├── pegawai/
   │ │ ├── kendaraan/
   │ │ └── dashboard/
   │ ├── tests/
   │ ├── drizzle.config.ts
   │ ├── Dockerfile
   │ └── package.json
   ├── frontend/
   │ ├── src/
   │ │ ├── api/ # axios instance + modul API per entitas
   │ │ ├── stores/ # Pinia: perangkatDaerah.ts, pegawai.ts, kendaraan.ts, dashboard.ts
   │ │ ├── views/ # Dashboard, Kendaraan{List,Form,Detail}, Pegawai..., PerangkatDaerah...
   │ │ ├── components/
   │ │ │ ├── ui/ # BaseButton, BaseInput, BaseSelect, DataTable, Pagination, Modal, ConfirmDialog, Toast, Badge
   │ │ │ └── kendaraan/ # KondisiBadge, PenanggungJawabSelect, dst.
   │ │ ├── composables/ # useQueryFilters, useDebounce, useToast
   │ │ ├── schemas/ # skema Zod form
   │ │ ├── router/
   │ │ ├── types/
   │ │ └── utils/
   │ ├── Dockerfile
   │ └── package.json
   ├── docker-compose.yml
   ├── .env.example
   └── README.md
   Backend

- Alur: routes (validasi & HTTP) → service (aturan bisnis) → repository (query Drizzle)
- Aturan bisnis lintas entitas (validasi penanggung jawab, cek relasi sebelum hapus) berada di service layer dan dijalankan dalam transaksi bila melibatkan lebih dari satu query
- updated_at diperbarui otomatis saat update
  Frontend (Pinia)
- Satu setup store per entitas dengan pola konsisten:
  - state: items, meta, filters, current, loading, error
  - actions: fetchList(), fetchById(id), create(payload), update(id, payload), remove(id)
- Store hanya menyimpan state & memanggil modul api/; komponen tidak memanggil axios langsung
- Setelah create/update/delete, muat ulang list atau perbarui item secara lokal
- Store dashboard di-refresh setelah ada perubahan data kendaraan

7. Keamanan & Kualitas

- Validasi semua input di backend (frontend hanya untuk UX)
- Semua query lewat Drizzle/parameterized (tanpa string concatenation SQL)
- CORS hanya untuk origin frontend dari env
- Jangan pernah membocorkan stack trace atau pesan error database mentah ke client
- Testing backend (bun test, memakai database test terpisah):
  - Validasi NIP, golongan, nomor polisi, tahun produksi
  - Aturan penanggung jawab harus satu perangkat daerah
  - Penolakan hapus perangkat daerah/pegawai yang masih berelasi
  - Duplikasi nomor polisi & NIP → 409
  - Pagination, filter, dan agregasi dashboard
- Testing frontend (Vitest): store Pinia (aksi CRUD dengan API di-mock), komponen PenanggungJawabSelect dan form kendaraan
- Linting & formatting: ESLint + Prettier (atau Biome)

8. Seeder

- 3 perangkat daerah: Dinas Pendidikan, Dinas Kesehatan, Dinas Pekerjaan Umum dan Penataan Ruang
- ±5 pegawai per perangkat daerah dengan NIP 18 digit yang realistis, jabatan dan golongan bervariasi
- ±20 kendaraan dengan merek/tipe umum (Toyota Innova, Toyota Avanza, Mitsubishi Pajero Sport, Honda Vario, Yamaha NMAX, Isuzu Elf, dll.), kondisi bervariasi, sebagian tanpa penanggung jawab
- Seeder bersifat idempoten (aman dijalankan ulang)

9. Urutan Pengerjaan (kerjakan bertahap, konfirmasi tiap fase)
1. Fase 0 — Setup: monorepo Bun, docker-compose PostgreSQL, Elysia + Drizzle, skema & migrasi, seeder, Vue 3 + Pinia + Router + Tailwind, layout dasar
1. Fase 1 — Perangkat Daerah: API CRUD + test, store Pinia, halaman list/form/detail
1. Fase 2 — Pegawai: API CRUD + validasi NIP/golongan + test, store, halaman
1. Fase 3 — Kendaraan Dinas: API CRUD + aturan penanggung jawab + PATCH kondisi + test, store, halaman dengan dropdown penanggung jawab dependen
1. Fase 4 — Dashboard: endpoint ringkasan, halaman dashboard, tautan ke daftar terfilter
1. Fase 5 — Penyempurnaan: pesan error, empty state, responsif, dokumentasi OpenAPI, README
   Di setiap fase:

- Tampilkan daftar file yang dibuat/diubah
- Sertakan cara menjalankan & menguji fitur tersebut
- Pastikan bun test di backend serta bun run build (type-check) di frontend lolos sebelum lanjut
  Opsional (kerjakan hanya setelah fase inti selesai dan diminta)
- Autentikasi admin sederhana (login JWT, satu role admin) untuk melindungi seluruh endpoint
- Tabel riwayat_penanggung_jawab (kendaraan_id, pegawai_id, mulai, selesai) yang terisi otomatis saat penanggung jawab berubah
- Ekspor daftar kendaraan ke Excel/CSV dan cetak PDF
- Soft delete dengan kolom deleted_at

10. Output yang Diharapkan

- Source code backend & frontend lengkap sesuai struktur di atas
- Skema Drizzle, file migrasi SQL, dan seeder
- docker-compose.yml, Dockerfile (multi-stage) untuk backend & frontend, .env.example
- Dokumentasi OpenAPI yang dapat diakses di /docs
- README.md berisi: cara setup lokal & via Docker, perintah migrasi/seed, ringkasan arsitektur, diagram relasi entitas (ERD, boleh Mermaid), daftar endpoint, dan aturan bisnis yang diterapkan
  Jika ada keputusan yang ambigu, pilih opsi yang paling umum dipakai di industri, tuliskan asumsinya di README, lalu lanjutkan.
