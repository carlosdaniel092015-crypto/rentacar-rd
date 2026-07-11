"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, ContactRound, Grid2X2, Menu, Plus, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Inicio", icon: Grid2X2 },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/vehiculos", label: "Vehículos", icon: Car },
  { href: "/admin/contactos", label: "Contactos", icon: ContactRound },
];

export function MobileAdminNav() {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/admin/vehiculos/nuevo"
        className="fixed bottom-[5.5rem] right-5 z-30 flex size-14 items-center justify-center rounded-[20px] bg-[#F2A83B] text-[#14263F] shadow-[0_12px_24px_-6px_rgba(242,168,59,0.6)] md:hidden"
        aria-label="Agregar vehículo"
      >
        <Plus className="size-7" strokeWidth={2.5} />
      </Link>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-[#ECE6DD] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold",
                active ? "text-[#14263F]" : "text-[#98A2B0]"
              )}
            >
              <item.icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("admin-menu-open"))}
          className="flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#98A2B0]"
        >
          <Menu className="size-5" />
          Más
        </button>
      </nav>
    </>
  );
}
