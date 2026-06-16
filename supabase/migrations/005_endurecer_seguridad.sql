-- Hallazgos del Security Advisor de Supabase, corregidos:

-- 1. categorias permitía que cualquier usuario autenticado escribiera, sin mirar
--    accesos por módulo (a diferencia de vehiculos/reservas, que ya exigían has_acceso).
drop policy if exists "categorias_admin" on categorias;

create policy "categorias_admin" on categorias
  for all to authenticated
  using (has_acceso('categorias'))
  with check (has_acceso('categorias'));

-- 2. fn_audit_table_change y rls_auto_enable son funciones de trigger internas;
--    no deben ser invocables directamente vía RPC por anon/authenticated.
revoke execute on function public.fn_audit_table_change() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

-- 3. search_path explícito en funciones SECURITY DEFINER (evita "search path hijacking").
alter function public.set_updated_at() set search_path = public;
alter function public.fn_audit_table_change() set search_path = public;
alter function public.is_principal(uuid) set search_path = public;
alter function public.has_acceso(text, uuid) set search_path = public;
alter function public.debe_cambiar_password(uuid) set search_path = public;
alter function public.mark_password_changed() set search_path = public;
