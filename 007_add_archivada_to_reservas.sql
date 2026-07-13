"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ESTADOS_RESERVA } from "@/lib/utils";
import type { EstadoReserva } from "@/lib/utils";

interface ReservaEstadoSelectProps {
  reservaId: string;
  vehiculoId: string;
  estadoActual: EstadoReserva;
}

export function ReservaEstadoSelect({ reservaId, vehiculoId, estadoActual }: ReservaEstadoSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // vehiculoId se mantiene como prop para compatibilidad con el componente padre
  void vehiculoId;

  const handleChange = async (nuevoEstado: EstadoReserva) => {
    if (nuevoEstado === estadoActual) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/reservas/${reservaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        toast.error("Error actualizando estado.");
        return;
      }

      toast.success(
        nuevoEstado === "confirmada"
          ? "Estado actualizado. Se envió correo de confirmación al cliente."
          : "Estado actualizado."
      );
      router.refresh();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const estadoConfig = ESTADOS_RESERVA.find((e) => e.value === estadoActual);

  return (
    <select
      value={estadoActual}
      onChange={(e) => handleChange(e.target.value as EstadoReserva)}
      disabled={loading}
      className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${estadoConfig?.color ?? ""}`}
    >
      {ESTADOS_RESERVA.map((e) => (
        <option key={e.value} value={e.value}>{e.label}</option>
      ))}
    </select>
  );
}
