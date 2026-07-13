"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

type VehiculoOpt = { id: string; nombre: string; precio_dia: number };

export function NuevaReservaForm({ vehiculos }: { vehiculos: VehiculoOpt[] }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [form, setForm] = useState({
    vehiculoId: vehiculos[0]?.id ?? "",
    nombreCliente: "",
    emailCliente: "",
    telefonoCliente: "",
    cedulaCliente: "",
    fechaInicio: "",
    fechaFin: "",
    notas: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const vehiculo = vehiculos.find((v) => v.id === form.vehiculoId);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idempotencyKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const msg =
          json?.error?.code === "FECHAS_OCUPADAS"
            ? "Esas fechas ya están ocupadas para este vehículo."
            : json?.error?.code === "NO_DISPONIBLE"
            ? "Este vehículo no está disponible."
            : json?.error?.issues?.[0]?.message ?? json?.error?.message ?? "Error creando la reserva.";
        toast.error(msg);
        return;
      }
      toast.success("Reserva creada.");
      router.push("/admin/reservas");
      router.refresh();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-4 max-w-xl">
      <div>
        <Label>Vehículo</Label>
        <select
          value={form.vehiculoId}
          onChange={(e) => set("vehiculoId", e.target.value)}
          className="mt-1 w-full text-sm rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          required
        >
          {vehiculos.length === 0 && <option value="">No hay vehículos disponibles</option>}
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre} — {formatCurrency(v.precio_dia)}/día
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Nombre del cliente</Label>
          <Input className="mt-1" value={form.nombreCliente} onChange={(e) => set("nombreCliente", e.target.value)} placeholder="ej. Juan Pérez" required />
        </div>
        <div>
          <Label>Correo</Label>
          <Input className="mt-1" type="email" value={form.emailCliente} onChange={(e) => set("emailCliente", e.target.value)} placeholder="juan@correo.com" required />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input className="mt-1" value={form.telefonoCliente} onChange={(e) => set("telefonoCliente", e.target.value)} placeholder="809-555-1234" required />
        </div>
        <div>
          <Label>Cédula / Pasaporte</Label>
          <Input className="mt-1" value={form.cedulaCliente} onChange={(e) => set("cedulaCliente", e.target.value)} placeholder="00100000001" required />
        </div>
        <div>
          <Label>Fecha inicio</Label>
          <Input className="mt-1" type="date" value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} required />
        </div>
        <div>
          <Label>Fecha fin</Label>
          <Input className="mt-1" type="date" value={form.fechaFin} min={form.fechaInicio || undefined} onChange={(e) => set("fechaFin", e.target.value)} required />
        </div>
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <Textarea className="mt-1" rows={3} value={form.notas} onChange={(e) => set("notas", e.target.value)} placeholder="Ej. entrega en el aeropuerto..." />
      </div>

      {vehiculo && <p className="text-xs text-[var(--color-muted-foreground)]">Precio: {formatCurrency(vehiculo.precio_dia)} por día. El total se calcula automáticamente según las fechas.</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="accent" size="lg" disabled={enviando || !form.vehiculoId}>
          {enviando ? "Creando..." : "Crear reserva"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
