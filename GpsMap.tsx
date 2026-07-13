"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { NotificacionesBell } from "./NotificacionesBell";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/admin/vehiculos": { title: "Vehículos", subtitle: "Gestiona tu flota" },
  "/admin/categorias": { title: "Categorías", subtitle: "Categorías de vehículos" },
  "/admin/reservas": { title: "Reservas", subtitle: "Gestiona las solicitudes" },
  "/admin/contactos": { title: "Contactos", subtitle: "Clientes y proveedores" },
  "/admin/encuestas": { title: "Encuestas", subtitle: "Satisfacción de clientes" },
  "/admin/analitica": { title: "Analítica", subtitle: "Últimos 6 meses" },
  "/admin/gps": { title: "GPS / Flota", subtitle: "Ubicación en tiempo real" },
  "/admin/logs": { title: "Logs", subtitle: "Actividad reciente" },
  "/admin/equipo": { title: "Equipo", subtitle: "Gestión de miembros" },
  "/admin/perfil": { title: "Mi perfil", subtitle: "Configuración de cuenta" },
};

export function MobileAdminHeader() {
  const pathname = usePathname();
  const meta = pageMeta[pathname];
  const isDashboard = pathname === "/admin";

  return (
    <header className={`bg-[linear-gradient(160deg,#1C3555_0%,#14263F_100%)] text-white md:hidden ${isDashboard ? "" : "rounded-b-[26px]"}`}>
      <div className={`flex items-center ${isDashboard ? "justify-between" : "gap-3"} px-5 pb-6 pt-[calc(env(safe-area-inset-top)+0.875rem)]`}>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("admin-menu-open"))}
          className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] border border-white/15 bg-white/10 text-[#EAF0F8]"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        {isDashboard ? (
          <>
            <div className="flex items-center gap-2">
              <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-[#F2A83B] text-xs font-extrabold text-[#14263F]">A3</span>
              <span className="text-[15px] font-bold text-[#EAF0F8]">Alma 3D Rent</span>
            </div>
            <NotificacionesBell variant="dark" />
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[22px] font-extrabold leading-tight">{meta?.title ?? "Panel administrativo"}</h1>
              <p className="mt-2 text-[13px] text-[#EAF0F8]/60">{meta?.subtitle ?? "Alma 3D Rent Card"}</p>
            </div>
            <NotificacionesBell variant="dark" />
          </>
        )}
      </div>
    </header>
  );
}
