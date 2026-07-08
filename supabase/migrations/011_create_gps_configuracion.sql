-- Sincronizada desde producción (Supabase migration 20260622183811).
-- RLS queda habilitada por defecto (rls_auto_enable trigger) sin políticas
-- para anon/authenticated: solo el service-role (rutas /api/admin/gps/*, ya
-- protegidas con tieneAcceso(member, "gps")) puede leer/escribir. El campo
-- "clave" se cifra en la capa aplicativa (src/lib/server/crypto.ts) antes de
-- guardarse aquí — a nivel de columna sigue siendo texto plano en reposo.
CREATE TABLE IF NOT EXISTS gps_configuracion (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  servidor_url text NOT NULL DEFAULT 'https://www.whatsgps.com',
  usuario     text NOT NULL DEFAULT '',
  clave       text NOT NULL DEFAULT '',
  activo      boolean NOT NULL DEFAULT false,
  ultimo_sync timestamptz,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Solo debe existir una fila
CREATE UNIQUE INDEX IF NOT EXISTS gps_configuracion_single ON gps_configuracion ((true));
