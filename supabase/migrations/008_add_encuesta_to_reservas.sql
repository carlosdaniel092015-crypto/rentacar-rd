-- Sincronizada desde producción (Supabase migration 20260618124509).
-- Referenciada por /api/encuesta y /api/admin/encuestas pero nunca se había
-- versionado en el repo.
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS encuesta_estrellas smallint CHECK (encuesta_estrellas BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS encuesta_comentario text,
  ADD COLUMN IF NOT EXISTS encuesta_fecha timestamptz;
