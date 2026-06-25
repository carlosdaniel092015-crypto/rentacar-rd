"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contacto } from "@/types/database.types";

interface ContactoFormProps {
  contacto?: Contacto;
  onSuccess?: (id: string) => void;
}

export function ContactoForm({ contacto, onSuccess }: ContactoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: contacto?.nombre ?? "",
    telefono: contacto?.telefono ?? "",
    cedula: contacto?.cedula ?? "",
    email: contacto?.email ?? "",
    notas: contacto?.notas ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = contacto ? `/api/admin/contactos/${contacto.id}` : "/api/admin/contactos";
      const method = contacto ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error ?? "Error al guardar");
        return;
      }
      toast.success(contacto ? "Contacto actualizado" : "Contacto creado");
      if (onSuccess) {
        onSuccess(json.data.id);
      } else {
        router.push(`/admin/contactos/${json.data.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input id="nombre" value={form.nombre} onChange={set("nombre")} required placeholder="Juan Pérez" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input id="telefono" value={form.telefono} onChange={set("telefono")} required placeholder="809-555-0000" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cedula">Cédula / Pasaporte *</Label>
          <Input id="cedula" value={form.cedula} onChange={set("cedula")} required placeholder="001-0000000-0" />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="cliente@ejemplo.com" />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="notas">Notas internas</Label>
          <textarea
            id="notas"
            value={form.notas}
            onChange={set("notas")}
            rows={3}
            placeholder="Observaciones del cliente..."
            className="w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Guardando..." : contacto ? "Guardar cambios" : "Crear contacto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
