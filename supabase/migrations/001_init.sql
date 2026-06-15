-- Extensión para constraint de exclusión (anti-doble-booking)
create extension if not exists btree_gist;

-- ENUMs
create type categoria_vehiculo as enum ('economico','sedan','suv','pickup','van','lujo','deportivo');
create type tipo_transmision as enum ('manual','automatica');
create type tipo_combustible as enum ('gasolina','diesel','hibrido','electrico');
create type estado_reserva as enum ('pendiente','confirmada','en_curso','completada','cancelada');

-- Tabla vehiculos
create table vehiculos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  marca text not null check (char_length(marca) <= 60),
  modelo text not null check (char_length(modelo) <= 60),
  anio smallint not null check (anio between 1990 and extract(year from now())::int + 1),
  categoria categoria_vehiculo not null,
  transmision tipo_transmision not null,
  combustible tipo_combustible not null,
  pasajeros smallint not null check (pasajeros between 1 and 20),
  precio_dia numeric(10,2) not null check (precio_dia > 0),
  disponible boolean not null default true,
  imagen_url text,
  imagenes_urls text[] not null default '{}',
  descripcion text,
  caracteristicas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla reservas
create table reservas (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id uuid not null references vehiculos(id) on delete restrict,
  nombre_cliente text not null check (char_length(nombre_cliente) between 2 and 120),
  email_cliente text not null check (email_cliente ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono_cliente text not null,
  cedula_cliente text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  dias int generated always as ((fecha_fin - fecha_inicio) + 1) stored,
  precio_dia numeric(10,2) not null check (precio_dia > 0),
  total numeric(12,2) generated always as (((fecha_fin - fecha_inicio) + 1) * precio_dia) stored,
  estado estado_reserva not null default 'pendiente',
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fechas_validas check (fecha_fin >= fecha_inicio),
  constraint estadia_maxima check ((fecha_fin - fecha_inicio) <= 90),
  -- Constraint principal anti-double-booking: reservas activas no pueden solaparse
  constraint sin_solapamiento_reservas exclude using gist (
    vehiculo_id with =,
    daterange(fecha_inicio, fecha_fin, '[]') with &&
  ) where (estado in ('pendiente','confirmada','en_curso'))
);

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vehiculos_updated_at before update on vehiculos
  for each row execute procedure set_updated_at();

create trigger reservas_updated_at before update on reservas
  for each row execute procedure set_updated_at();

-- Índices
create index idx_vehiculos_filtros on vehiculos (categoria, transmision, pasajeros)
  where disponible = true;
create index idx_vehiculos_precio on vehiculos (precio_dia)
  where disponible = true;
create index idx_reservas_vehiculo on reservas (vehiculo_id);
create index idx_reservas_estado_fecha on reservas (estado, fecha_inicio);
create index idx_reservas_fechas_gist on reservas using gist (
  daterange(fecha_inicio, fecha_fin, '[]')
);

-- RLS
alter table vehiculos enable row level security;
alter table reservas enable row level security;

-- Vehículos: lectura pública, escritura solo autenticados
create policy "vehiculos_select_public" on vehiculos
  for select to anon, authenticated using (true);

create policy "vehiculos_insert_admin" on vehiculos
  for insert to authenticated with check (true);

create policy "vehiculos_update_admin" on vehiculos
  for update to authenticated using (true) with check (true);

create policy "vehiculos_delete_admin" on vehiculos
  for delete to authenticated using (true);

-- Reservas: inserción controlada por el servidor (service_role), lectura/edición solo admin
create policy "reservas_select_admin" on reservas
  for select to authenticated using (true);

create policy "reservas_update_admin" on reservas
  for update to authenticated using (true) with check (true);

-- anon NO tiene acceso a reservas. Las inserciones van por el Route Handler con service_role.

-- Storage bucket para imágenes de vehículos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehiculos',
  'vehiculos',
  true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','image/avif']
) on conflict (id) do nothing;

-- Solo autenticados pueden subir/borrar imágenes
create policy "vehiculos_images_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'vehiculos');

create policy "vehiculos_images_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'vehiculos');

create policy "vehiculos_images_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'vehiculos');
