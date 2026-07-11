-- Notificaciones internas del panel (ej. nueva reserva desde la web).
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'reserva',
  titulo text not null,
  mensaje text,
  url text,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS habilitada sin políticas: solo el service-role accede (las rutas admin ya
-- validan la sesión con getCurrentMember). Igual patrón que audit_logs.
alter table notificaciones enable row level security;

create index if not exists notificaciones_no_leidas_idx
  on notificaciones (leida, created_at desc);
