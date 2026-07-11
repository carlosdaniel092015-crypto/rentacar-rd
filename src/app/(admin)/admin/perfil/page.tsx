import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentMember } from "@/lib/server/equipo";
import { PerfilForm } from "@/components/admin/PerfilForm";

export const metadata: Metadata = { title: "Mi perfil | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPerfilPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/sin-acceso");

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="hidden text-2xl font-bold md:block">Mi perfil</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          {member.nombre} · {member.cargo}
        </p>
      </div>

      <PerfilForm obligatorio={member.debe_cambiar_password} />
    </div>
  );
}
