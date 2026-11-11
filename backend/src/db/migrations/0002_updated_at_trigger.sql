-- Pengaman kedua: updated_at selalu diperbarui pada setiap UPDATE,
-- termasuk perubahan yang dilakukan di luar aplikasi (mis. lewat psql).
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER perangkat_daerah_set_updated_at BEFORE UPDATE ON perangkat_daerah
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER pegawai_set_updated_at BEFORE UPDATE ON pegawai
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint
CREATE TRIGGER kendaraan_dinas_set_updated_at BEFORE UPDATE ON kendaraan_dinas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
