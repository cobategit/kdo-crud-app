-- Ekstensi untuk pencarian teks (index GIN trigram pada nama, nomor_polisi, merek, tipe_model).
-- gen_random_uuid() sudah bawaan PostgreSQL 13+, sehingga pgcrypto tidak diperlukan.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
