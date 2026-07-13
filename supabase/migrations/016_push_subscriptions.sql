-- Suscripciones Web Push de los dispositivos del panel (notificaciones nativas).
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS habilitada sin políticas: solo el service-role accede (rutas admin validan sesión).
alter table push_subscriptions enable row level security;
