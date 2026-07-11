"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, LogOut, Tag, ScrollText,
  Users, UserCircle, Car, ExternalLink, Menu, X,
  BarChart3, MapPin, BookUser, Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Modulo } from "@/lib/equipo-shared";

const navLinks = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard",   modulo: null as Modulo | null },
  { href: "/admin/vehiculos",  icon: Car,             label: "Vehículos",   modulo: "vehiculos" as Modulo },
  { href: "/admin/categorias", icon: Tag,             label: "Categorías",  modulo: "categorias" as Modulo },
  { href: "/admin/reservas",   icon: CalendarCheck,   label: "Reservas",    modulo: "reservas" as Modulo },
  { href: "/admin/contactos",  icon: BookUser,        label: "Contactos",   modulo: "contactos" as Modulo },
  { href: "/admin/encuestas",  icon: Star,            label: "Encuestas",   modulo: "encuestas" as Modulo },
  { href: "/admin/analitica",  icon: BarChart3,       label: "Analítica",   modulo: "analitica" as Modulo },
  { href: "/admin/gps",        icon: MapPin,          label: "GPS / Flota", modulo: "gps" as Modulo },
  { href: "/admin/logs",       icon: ScrollText,      label: "Logs",        modulo: "logs" as Modulo },
  { href: "/admin/equipo",     icon: Users,           label: "Equipo",      modulo: "equipo" as Modulo },
  { href: "/admin/perfil",     icon: UserCircle,      label: "Mi perfil",   modulo: null as Modulo | null },
];

interface AdminSidebarProps {
  rol: "principal" | "miembro";
  accesos: Modulo[];
}

export function AdminSidebar({ rol, accesos }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = navLinks.filter(
    (l) => l.modulo === null || rol === "principal" || accesos.includes(l.modulo)
  );

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const SidebarContent = () => (
    <aside className="w-[min(20rem,86vw)] lg:w-64 bg-[var(--color-primary)] flex flex-col h-full">
      <div
        className="flex items-center justify-between gap-2 px-5 lg:px-6 text-white font-bold text-xl lg:text-lg border-b border-white/10"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)", paddingBottom: "20px" }}
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-xs tracking-tight">A3</div>
          Alma 3D Rent Card
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden text-white/70 hover:text-white p-1"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-[var(--radius)] text-base lg:text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="size-5.5 lg:size-5 shrink-0" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="size-4" />
          Ver sitio principal
        </Link>
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

  return (
    <>
      {/* ── Botón hamburguesa — solo mobile, respeta safe-area del iPhone ── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed z-50 size-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md"
        style={{ top: "calc(env(safe-area-inset-top) + 10px)", left: "12px" }}
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      {/* ── Backdrop móvil ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar móvil (drawer) ── */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>

      {/* ── Sidebar desktop (estático en el flex) ── */}
      <div className="hidden lg:flex shrink-0 min-h-screen">
        <SidebarContent />
      </div>
    </>
  );
}
