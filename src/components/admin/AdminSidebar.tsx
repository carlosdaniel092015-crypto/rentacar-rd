"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, LayoutDashboard, CalendarCheck, LogOut, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/vehiculos", icon: Car, label: "Vehículos" },
  { href: "/admin/categorias", icon: Tag, label: "Categorías" },
  { href: "/admin/reservas", icon: CalendarCheck, label: "Reservas" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 shrink-0 bg-[var(--color-primary)] flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5 text-white font-bold text-lg border-b border-white/10">
        <Car className="size-6" />
        RentaCar RD
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="size-5" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
