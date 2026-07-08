-- Sincronizada desde producción (Supabase migration 20260622180536).
-- RLS queda habilitada por defecto (rls_auto_enable trigger) sin políticas
-- para anon/authenticated: solo el service-role (rutas /api/admin/contactos,
-- ya protegidas con tieneAcceso(member, "contactos")) puede leer/escribir.
CREATE TABLE IF NOT EXISTS contactos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  telefono    text NOT NULL,
  cedula      text NOT NULL,
  email       text NOT NULL DEFAULT '',
  notas       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contactos_telefono_unique UNIQUE (telefono),
  CONSTRAINT contactos_cedula_unique   UNIQUE (cedula)
);

CREATE OR REPLACE FUNCTION update_contactos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_contactos_updated_at
  BEFORE UPDATE ON contactos
  FOR EACH ROW EXECUTE FUNCTION update_contactos_updated_at();

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS contacto_id uuid REFERENCES contactos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_contacto_id ON reservas(contacto_id);
