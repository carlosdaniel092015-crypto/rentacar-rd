-- Jerarquía de usuarios del panel admin.
-- "principal" = CEO/líder, acceso total siempre, único rol que puede gestionar el equipo.
-- Los demás miembros tienen un cargo libre (texto) y un set de accesos por módulo.
create table equipo (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text not null check (char_length(nombre) between 2 and 120),
  cargo text not null check (char_length(cargo) between 2 and 80),
  rol text not null default 'miembro' check (rol in ('principal', 'miembro')),
  accesos text[] not null default '{}',
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Los módulos válidos hoy: vehiculos, reservas, categorias, logs, automatizacion, equipo
  constraint accesos_validos check (
    accesos <@ array['vehiculos','reservas','categorias','logs','automatizacion','equipo']::text[]
  )
);

create trigger equipo_updated_at before update on equipo
  for each row execute procedure set_updated_at();

-- Helper: ¿el usuario autenticado es principal (CEO/líder) y está activo?
create or replace function is_principal(uid uuid default auth.uid())
returns boolean as $$
  select exists (
    select 1 from equipo where id = uid and rol = 'principal' and activo = true
  );
$$ language sql security definer stable;

-- Helper: ¿el usuario autenticado tiene acceso al módulo dado? (principal siempre true)
create or replace function has_acceso(modulo text, uid uuid default auth.uid())
returns boolean as $$
  select exists (
    select 1 from equipo
    where id = uid and activo = true
      and (rol = 'principal' or modulo = any(accesos))
  );
$$ language sql security definer stable;

alter table equipo enable row level security;

-- Cualquier miembro autenticado puede ver su propia fila (para conocer sus accesos);
-- el principal puede ver y gestionar todo el equipo.
create policy "equipo_select_self_or_principal" on equipo
  for select to authenticated using (id = auth.uid() or is_principal());

create policy "equipo_insert_principal" on equipo
  for insert to authenticated with check (is_principal());

create policy "equipo_update_principal" on equipo
  for update to authenticated using (is_principal()) with check (is_principal());

create policy "equipo_delete_principal" on equipo
  for delete to authenticated using (is_principal());

-- Endurecer accesos existentes: vehiculos y reservas ahora exigen el módulo correspondiente
-- (o ser principal). La lectura pública de vehiculos no cambia (catálogo del sitio).
drop policy if exists "vehiculos_insert_admin" on vehiculos;
drop policy if exists "vehiculos_update_admin" on vehiculos;
drop policy if exists "vehiculos_delete_admin" on vehiculos;

create policy "vehiculos_insert_admin" on vehiculos
  for insert to authenticated with check (has_acceso('vehiculos'));

create policy "vehiculos_update_admin" on vehiculos
  for update to authenticated using (has_acceso('vehiculos')) with check (has_acceso('vehiculos'));

create policy "vehiculos_delete_admin" on vehiculos
  for delete to authenticated using (has_acceso('vehiculos'));

drop policy if exists "reservas_select_admin" on reservas;
drop policy if exists "reservas_update_admin" on reservas;

create policy "reservas_select_admin" on reservas
  for select to authenticated using (has_acceso('reservas'));

create policy "reservas_update_admin" on reservas
  for update to authenticated using (has_acceso('reservas')) with check (has_acceso('reservas'));

-- Sembrar al usuario principal (CEO/líder) a partir de la cuenta admin ya existente.
insert into equipo (id, email, nombre, cargo, rol, accesos)
select id, email, 'Carlos Daniel', 'CEO / Fundador', 'principal', '{}'
from auth.users
where email = 'carlosdaniel092015@gmail.com'
on conflict (id) do update set rol = 'principal', activo = true;
