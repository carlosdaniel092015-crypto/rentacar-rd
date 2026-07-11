import type { Metadata } from "next";
import type React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
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
    <div className="flex min-h-screen bg-[var(--color-muted)]">
      <AdminSidebar rol={member.rol} accesos={member.accesos} />
      <header className="fixed inset-x-0 top-0 z-30 flex h-[calc(env(safe-area-inset-top)+4rem)] items-end justify-center bg-[#14263F] px-20 pb-3 lg:hidden">
        <div className="flex items-center gap-2 text-[#EAF0F8]">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#F2A83B] text-[10px] font-black text-[#14263F]">A3</span>
          <p className="truncate text-sm font-bold">Alma 3D Rent</p>
        </div>
      </header>
      {/* min-w-0 + w-full: sin esto, una tabla ancha estira el <main> más que la
          pantalla en móvil (bug de flexbox `min-width: auto`) y encoge toda la
          página. Con min-w-0, la tabla hace scroll interno y la página queda
          ajustada al ancho del teléfono. */}
      <main className="flex-1 w-full min-w-0 overflow-auto">
        <div
          className="p-5 lg:p-8 lg:pt-6 min-w-0"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 4.75rem)" } as React.CSSProperties}
        >
          {children}
        </div>
      </main>
      <MobileAdminNav />
    </div>
  );
}
