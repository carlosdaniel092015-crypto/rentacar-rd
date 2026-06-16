-- Obliga a cambiar la contraseña en el primer inicio de sesión y permite
-- que cada usuario marque ese cambio como hecho desde su propia sesión.
alter table equipo add column debe_cambiar_password boolean not null default true;

-- Los usuarios que ya existían (creados antes de este cambio) ya tienen su propia
-- contraseña establecida; no se les debe forzar un cambio.
update equipo set debe_cambiar_password = false;

create or replace function debe_cambiar_password(uid uuid default auth.uid())
returns boolean as $$
  select coalesce(
    (select debe_cambiar_password from equipo where id = uid and activo = true),
    false
  );
$$ language sql security definer stable;

create or replace function mark_password_changed()
returns void as $$
  update equipo set debe_cambiar_password = false where id = auth.uid();
$$ language sql security definer;
