-- Sincronizada desde producción (Supabase migration 20260618124731).
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS gps_device_id text;
