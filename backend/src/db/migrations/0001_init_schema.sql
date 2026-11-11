CREATE TYPE "public"."kondisi_kendaraan" AS ENUM('baik', 'rusak_ringan', 'rusak_berat');--> statement-breakpoint
CREATE TABLE "kendaraan_dinas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor_polisi" varchar(12) NOT NULL,
	"merek" varchar(50) NOT NULL,
	"tipe_model" varchar(100) NOT NULL,
	"tahun_produksi" smallint NOT NULL,
	"warna" varchar(30) NOT NULL,
	"kondisi" "kondisi_kendaraan" DEFAULT 'baik' NOT NULL,
	"perangkat_daerah_id" uuid NOT NULL,
	"pegawai_id" uuid,
	"keterangan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kendaraan_dinas_nomor_polisi_format_ck" CHECK ("kendaraan_dinas"."nomor_polisi" ~ '^[A-Z]{1,2} [0-9]{1,4}( [A-Z]{1,3})?$'),
	CONSTRAINT "kendaraan_dinas_tahun_produksi_ck" CHECK ("kendaraan_dinas"."tahun_produksi" >= 1980 AND "kendaraan_dinas"."tahun_produksi" <= 2100)
);
--> statement-breakpoint
CREATE TABLE "pegawai" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(150) NOT NULL,
	"nip" char(18) NOT NULL,
	"jabatan" varchar(150) NOT NULL,
	"golongan" varchar(5) NOT NULL,
	"perangkat_daerah_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pegawai_nip_format_ck" CHECK ("pegawai"."nip" ~ '^[0-9]{18}$'),
	CONSTRAINT "pegawai_golongan_ck" CHECK ("pegawai"."golongan" IN ('I/a', 'I/b', 'I/c', 'I/d', 'II/a', 'II/b', 'II/c', 'II/d', 'III/a', 'III/b', 'III/c', 'III/d', 'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e'))
);
--> statement-breakpoint
CREATE TABLE "perangkat_daerah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(150) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kendaraan_dinas" ADD CONSTRAINT "kendaraan_dinas_perangkat_daerah_id_perangkat_daerah_id_fk" FOREIGN KEY ("perangkat_daerah_id") REFERENCES "public"."perangkat_daerah"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "kendaraan_dinas" ADD CONSTRAINT "kendaraan_dinas_pegawai_id_pegawai_id_fk" FOREIGN KEY ("pegawai_id") REFERENCES "public"."pegawai"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_perangkat_daerah_id_perangkat_daerah_id_fk" FOREIGN KEY ("perangkat_daerah_id") REFERENCES "public"."perangkat_daerah"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "kendaraan_dinas_nomor_polisi_uq" ON "kendaraan_dinas" USING btree ("nomor_polisi");--> statement-breakpoint
CREATE INDEX "kendaraan_dinas_perangkat_daerah_id_idx" ON "kendaraan_dinas" USING btree ("perangkat_daerah_id");--> statement-breakpoint
CREATE INDEX "kendaraan_dinas_pegawai_id_idx" ON "kendaraan_dinas" USING btree ("pegawai_id");--> statement-breakpoint
CREATE INDEX "kendaraan_dinas_kondisi_idx" ON "kendaraan_dinas" USING btree ("kondisi");--> statement-breakpoint
CREATE INDEX "kendaraan_dinas_nomor_polisi_trgm_idx" ON "kendaraan_dinas" USING gin ("nomor_polisi" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "kendaraan_dinas_merek_trgm_idx" ON "kendaraan_dinas" USING gin ("merek" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "kendaraan_dinas_tipe_model_trgm_idx" ON "kendaraan_dinas" USING gin ("tipe_model" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "pegawai_nip_uq" ON "pegawai" USING btree ("nip");--> statement-breakpoint
CREATE INDEX "pegawai_perangkat_daerah_id_idx" ON "pegawai" USING btree ("perangkat_daerah_id");--> statement-breakpoint
CREATE INDEX "pegawai_nama_idx" ON "pegawai" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "pegawai_nama_trgm_idx" ON "pegawai" USING gin ("nama" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "perangkat_daerah_nama_lower_uq" ON "perangkat_daerah" USING btree (lower("nama"));--> statement-breakpoint
CREATE INDEX "perangkat_daerah_nama_trgm_idx" ON "perangkat_daerah" USING gin ("nama" gin_trgm_ops);