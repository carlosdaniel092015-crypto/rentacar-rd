import type { Metadata } from "next";
import type React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import { MobileAdminHeader } from "@/components/admin/MobileAdminHeader";
import { getCurrentMember } from "@/lib/server/equipo";

export const metadata: Metadata = {
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alma 3D Admin",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const member = await getCurrentMember();
  if (!member) redirect("/sin-acceso");

  return (
    <div className="admin-mobile-shell flex min-h-screen bg-[#F5F1EB] md:bg-[var(--color-muted)]">
      <AdminSidebar rol={member.rol} accesos={member.accesos} />
      {/* min-w-0 + w-full: sin esto, una tabla ancha estira el <main> más que la
          pantalla en móvil (bug de flexbox `min-width: auto`) y encoge toda la
          página. Con min-w-0, la tabla hace scroll interno y la página queda
          ajustada al ancho del teléfono. */}
      <main className="flex-1 w-full min-w-0 overflow-auto">
        <MobileAdminHeader />
        <div
          className="min-w-0 p-5 pt-4 md:p-8 md:pt-6"
        >
          {children}
        </div>
      </main>
      <MobileAdminNav />
    </div>
  );
}
