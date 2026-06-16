import "server-only";
import { createClient } from "@/lib/supabase/server";
import { type Modulo, type MiembroEquipo } from "@/lib/equipo-shared";

export { MODULOS, type Modulo, type MiembroEquipo } from "@/lib/equipo-shared";

// Lee el registro de equipo del usuario autenticado actual (vía su propia sesión).
// Devuelve null si no está autenticado o no pertenece al equipo (sin acceso al panel).
export async function getCurrentMember(): Promise<MiembroEquipo | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("equipo")
    .select("id, email, nombre, cargo, rol, accesos, activo, debe_cambiar_password")
    .eq("id", user.id)
    .single<MiembroEquipo>();

  if (!data || !data.activo) return null;
  return data;
}

export function tieneAcceso(member: MiembroEquipo | null, modulo: Modulo): boolean {
  if (!member) return false;
  if (member.rol === "principal") return true;
  return member.accesos.includes(modulo);
}
