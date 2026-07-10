-- ============================================================================
-- Idempotencia en reservas
-- ----------------------------------------------------------------------------
-- Evita reservas duplicadas cuando el mismo envío llega dos veces: doble-click
-- que escape al front, reintento de red del navegador, o doble procesamiento
-- en serverless. El cliente genera una `idempotency_key` (UUID) una vez por
-- formulario; el índice único garantiza que solo se cree UNA reserva por clave.
-- El endpoint, ante el error de duplicado (23505), devuelve la reserva original.
-- ============================================================================

alter table reservas add column if not exists idempotency_key text;

-- Índice único parcial: solo aplica cuando hay clave; las reservas antiguas
-- (idempotency_key null) no se ven afectadas.
create unique index if not exists reservas_idempotency_key_uidx
  on reservas (idempotency_key)
  where idempotency_key is not null;
