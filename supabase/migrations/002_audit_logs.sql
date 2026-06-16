-- Tabla de logs de auditoría: acciones admin, logins, errores y visitas.
-- RLS habilitado SIN policies => solo accesible vía service_role (nunca por anon/authenticated desde el cliente).
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('admin_action','login','error','visit')),
  level text not null default 'info' check (level in ('info','warn','error')),
  actor_email text,
  ip text,
  path text,
  method text,
  message text,
  details jsonb not null default '{}'
);

alter table audit_logs enable row level security;
-- Sin policies: ni anon ni authenticated pueden leer/escribir vía API. Solo service_role (bypassa RLS).

create index idx_audit_logs_created_at on audit_logs (created_at desc);
create index idx_audit_logs_type on audit_logs (type, created_at desc);

-- Trigger: registra automáticamente cambios en vehiculos, reservas y categorias
-- usando el email del JWT de quien hizo la petición vía PostgREST.
create or replace function fn_audit_table_change()
returns trigger as $$
declare
  actor text;
begin
  begin
    actor := current_setting('request.jwt.claims', true)::jsonb ->> 'email';
  exception when others then
    actor := null;
  end;

  insert into audit_logs (type, actor_email, message, details)
  values (
    'admin_action',
    actor,
    format('%s en %s', TG_OP, TG_TABLE_NAME),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'op', TG_OP,
      'record_id', coalesce((case when TG_OP = 'DELETE' then old.id else new.id end), null),
      'old', case when TG_OP in ('UPDATE','DELETE') then to_jsonb(old) else null end,
      'new', case when TG_OP in ('UPDATE','INSERT') then to_jsonb(new) else null end
    )
  );

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger audit_vehiculos
  after insert or update or delete on vehiculos
  for each row execute procedure fn_audit_table_change();

create trigger audit_reservas
  after insert or update or delete on reservas
  for each row execute procedure fn_audit_table_change();

create trigger audit_categorias
  after insert or update or delete on categorias
  for each row execute procedure fn_audit_table_change();
