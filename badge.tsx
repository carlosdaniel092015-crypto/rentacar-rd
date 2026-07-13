"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, ContactRound, Grid2X2, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Inicio", icon: Grid2X2 },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/vehiculos", label: "Vehículos", icon: Car },
  { href: "/admin/contactos", label: "Contactos", icon: ContactRound },
];

// Barra inferior móvil. Los módulos que no están aquí (GPS, Logs, Equipo, etc.)
// se abren desde la hamburguesa del encabezado. Se quitaron el FAB "+" y el
// botón "Más" (este último era redundante con la hamburguesa).
export function MobileAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-[#ECE6DD] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-14 flex-col items-center gap-1 px-2 py-1 text-[10px] font-semibold",
              active ? "text-[#14263F]" : "text-[#98A2B0]"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                active ? "bg-[#14263F]/10 text-[#14263F]" : "text-[#98A2B0]"
              )}
            >
              <item.icon className="size-5" strokeWidth={active ? 2.5 : 2} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
