-- Sincronizada desde producción (Supabase migration 20260617144101).
-- Referenciada por el código (archivar/restaurar reservas) pero nunca se
-- había versionado en el repo.
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS archivada boolean NOT NULL DEFAULT false;
