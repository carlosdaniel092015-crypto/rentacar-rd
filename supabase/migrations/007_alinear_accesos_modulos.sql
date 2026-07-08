-- El check constraint original de equipo.accesos solo permitía
-- vehiculos/reservas/categorias/logs/automatizacion/equipo. Los módulos
-- contactos/encuestas/gps/analitica ya existen en el código (MODULOS en
-- src/lib/equipo-shared.ts, y ahora también en los guards tieneAcceso() de
-- las rutas admin) pero un principal no podía concederlos: el UPDATE a
-- equipo.accesos fallaba con "violates check constraint accesos_validos".
alter table equipo drop constraint accesos_validos;

alter table equipo add constraint accesos_validos check (
  accesos <@ array[
    'vehiculos','reservas','categorias','logs','automatizacion','equipo',
    'contactos','encuestas','analitica','gps'
  ]::text[]
);
