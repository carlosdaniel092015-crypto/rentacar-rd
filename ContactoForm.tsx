"use client";

import { Menu } from "lucide-react";
import { NotificacionesBell } from "./NotificacionesBell";

export function DashboardMobileHeader({ greetingName }: { greetingName: string }) {
  return (
    <div className="rounded-b-[28px] bg-[linear-gradient(160deg,#1C3555_0%,#14263F_100%)] px-5 pb-8 pt-[calc(env(safe-area-inset-top)+0.875rem)] text-white shadow-[0_10px_30px_-12px_rgba(20,38,63,0.55)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("admin-menu-open"))}
          className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] border border-white/15 bg-white/10 text-[#EAF0F8] transition-transform active:scale-95"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-[#F2A83B] text-xs font-extrabold text-[#14263F]">A3</span>
          <span className="text-[15px] font-bold text-[#EAF0F8]">Alma 3D Rent</span>
        </div>

        <NotificacionesBell variant="dark" />
      </div>

      <div className="mt-7">
        <p className="text-[13px] font-medium text-[#EAF0F8]/60">Buenos días,</p>
        <h1 className="mt-1 break-words text-[26px] font-extrabold leading-tight tracking-normal">{greetingName}</h1>
        <p className="mt-2 text-[13px] text-[#EAF0F8]/55">Resumen general del negocio</p>
      </div>
    </div>
  );
}
