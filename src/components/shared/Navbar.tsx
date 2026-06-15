"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Car, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--color-primary)]">
          <Car className="size-6" aria-hidden />
          <span className="text-xl">RentaCar RD</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[var(--color-primary)]",
                pathname === link.href
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-muted-foreground)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href="/login" className="flex items-center gap-1.5">
              <LogIn className="size-4" />
              Login
            </Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href="/catalogo">Reservar ahora</Link>
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-bold text-[var(--color-primary)] mb-8"
            >
              <Car className="size-6" />
              <span className="text-xl">RentaCar RD</span>
            </Link>
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-[var(--color-primary)]",
                    pathname === link.href
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-foreground)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
              <Button asChild variant="accent" className="w-full">
                <Link href="/catalogo" onClick={() => setOpen(false)}>
                  Reservar ahora
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
