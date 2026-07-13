import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ContactoForm } from "@/components/admin/ContactoForm";

export const metadata: Metadata = { title: "Nuevo contacto | Admin" };

export default function NuevoContactoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/contactos"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-3"
        >
          <ChevronLeft className="size-4" /> Contactos
        </Link>
        <h1 className="text-2xl font-bold">Nuevo contacto</h1>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <ContactoForm />
      </div>
    </div>
  );
}
