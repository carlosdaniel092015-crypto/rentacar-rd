-- Hallazgos restantes del Security Advisor:

-- 1. btree_gist vivía en el schema public; Supabase recomienda moverlo a "extensions"
--    (ya existe ese schema y el search_path por defecto ya lo incluye, así que el
--    exclusion constraint anti-doble-reserva de "reservas" sigue funcionando igual).
alter extension btree_gist set schema extensions;

-- 2. El bucket "vehiculos" es público y se sirve vía /storage/v1/object/public/...,
--    que no depende de RLS. Esta política solo habilitaba listar/enumerar todos
--    los archivos vía la API autenticada/anon; no es necesaria para que las URLs
--    públicas de las fotos sigan funcionando.
drop policy if exists "vehiculos_images_public_read" on storage.objects;
