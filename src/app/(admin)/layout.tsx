import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentMember } from "@/lib/server/equipo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const member = await getCurrentMember();
  if (!member) redirect("/sin-acceso");

  return (
    <div className="flex min-h-screen bg-[var(--color-muted)]">
      <AdminSidebar rol={member.rol} accesos={member.accesos} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
