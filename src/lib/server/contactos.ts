/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from "@/lib/supabase/admin";

interface DatosContacto {
  nombre: string;
  telefono: string;
  cedula: string;
  email?: string;
}

/**
 * Busca un contacto por teléfono O cédula.
 * Si existe → actualiza nombre y email con los datos más recientes y devuelve su ID.
 * Si no existe → lo crea y devuelve su ID.
 * Nunca crea duplicados.
 */
export async function upsertContacto(datos: DatosContacto): Promise<string | null> {
  const supabase = createAdminClient() as any;

  const { data: existentes } = await supabase
    .from("contactos")
    .select("id, telefono, cedula")
    .or(`telefono.eq.${datos.telefono},cedula.eq.${datos.cedula}`)
    .limit(1);

  if (existentes && existentes.length > 0) {
    const contacto = existentes[0];
    await supabase
      .from("contactos")
      .update({
        nombre: datos.nombre,
        email: datos.email ?? "",
        telefono: datos.telefono,
        cedula: datos.cedula,
      })
      .eq("id", contacto.id);
    return contacto.id as string;
  }

  const { data: nuevo } = await supabase
    .from("contactos")
    .insert({
      nombre: datos.nombre,
      telefono: datos.telefono,
      cedula: datos.cedula,
      email: datos.email ?? "",
    })
    .select("id")
    .single();

  return (nuevo?.id as string) ?? null;
}
