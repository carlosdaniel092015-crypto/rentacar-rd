-- ============================================================================
-- Habilitar RLS EXPLÍCITAMENTE en las tablas nuevas.
-- ----------------------------------------------------------------------------
-- Hallazgo (auditoría): las migraciones 010 (contactos) y 011 (gps_configuracion)
-- NO habilitan RLS de forma explícita; dependen del trigger `rls_auto_enable`,
-- cuya definición vive solo en producción (no está versionada en el repo). Si
-- estas migraciones se corren en una BD nueva/limpia que aún no tenga ese event
-- trigger, las tablas quedarían con RLS DESACTIVADA y expuestas vía PostgREST
-- con la anon key (que es pública): fuga de PII en `contactos` (nombre, teléfono,
-- cédula, email) y de credenciales en `gps_configuracion`.
--
-- Las migraciones 001/002/003 sí habilitan RLS explícitamente; esto restablece
-- esa consistencia. Es idempotente: si el trigger ya la habilitó, no hace daño.
-- Sin políticas para anon/authenticated => solo service-role accede (las rutas
-- /api/admin/contactos y /api/admin/gps/* ya validan tieneAcceso()).
-- ============================================================================

alter table contactos enable row level security;
alter table gps_configuracion enable row level security;

-- Opcional (defensa en profundidad): FORCE somete también al owner a la RLS.
-- No es imprescindible aquí porque el acceso es por roles anon/authenticated/
-- service_role, pero no estorba.
-- alter table contactos force row level security;
-- alter table gps_configuracion force row level security;

-- ── Verificación: ambas deben devolver relrowsecurity = true ────────────────
-- select relname, relrowsecurity
--   from pg_class
--  where relname in ('contactos','gps_configuracion');
