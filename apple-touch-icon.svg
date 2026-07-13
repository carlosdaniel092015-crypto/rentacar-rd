import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember, type MiembroEquipo } from "@/lib/server/equipo";
import { EquipoManager } from "@/components/admin/EquipoManager";

export const metadata: Metadata = { title: "Equipo | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminEquipoPage() {
  const member = await getCurrentMember();
  if (!member || member.rol !== "principal") notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("equipo")
    .select("id, email, nombre, cargo, rol, accesos, activo, debe_cambiar_password, created_at")
    .order("created_at", { ascending: true })
    .returns<(MiembroEquipo & { created_at: string })[]>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="hidden text-2xl font-bold md:block">Equipo</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          Jerarquía y accesos del panel administrativo. Solo el principal (CEO/líder) puede crear
          y gestionar usuarios.
        </p>
      </div>

      <EquipoManager miembros={data ?? []} principalId={member.id} />
    </div>
  );
}
