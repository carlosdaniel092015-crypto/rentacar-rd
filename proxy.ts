"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contacto } from "@/types/database.types";

export function ContactoEditInline({ contacto }: { contacto: Contacto }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: contacto.nombre,
    telefono: contacto.telefono,
    cedula: contacto.cedula,
    email: contacto.email,
    notas: contacto.notas ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contactos/${contacto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) { toast.error(json.error ?? "Error al guardar"); return; }
      toast.success("Contacto actualizado");
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el contacto "${contacto.nombre}"? Las reservas no se eliminarán.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contactos/${contacto.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) { toast.error(json.error ?? "Error al eliminar"); return; }
      toast.success("Contacto eliminado");
      router.push("/admin/contactos");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(true)}>
          <Pencil className="size-3.5 mr-1.5" /> Editar
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-5 space-y-3">
      <h3 className="font-semibold text-sm">Editar contacto</h3>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="e-nombre">Nombre *</Label>
          <Input id="e-nombre" value={form.nombre} onChange={set("nombre")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-telefono">Teléfono *</Label>
          <Input id="e-telefono" value={form.telefono} onChange={set("telefono")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-cedula">Cédula / Pasaporte *</Label>
          <Input id="e-cedula" value={form.cedula} onChange={set("cedula")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-email">Correo</Label>
          <Input id="e-email" type="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-notas">Notas internas</Label>
          <textarea
            id="e-notas"
            value={form.notas}
            onChange={set("notas")}
            rows={2}
            className="w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="accent" size="sm" onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? "Guardando..." : "Guardar"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
