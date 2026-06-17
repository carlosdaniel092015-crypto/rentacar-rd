"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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

  const handleChange = async (nuevoEstado: EstadoReserva) => {
    if (nuevoEstado === estadoActual) return;
    setLoading(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("reservas") as any)
      .update({ estado: nuevoEstado })
      .eq("id", reservaId);

    if (error) {
      toast.error("Error actualizando estado.");
      setLoading(false);
      return;
    }

    // Sincronizar disponibilidad del vehículo según el nuevo estado:
    // confirmada/en_curso/completada → no disponible (visible pero no reservable)
    // cancelada → restaurar disponible para que el cliente pueda reservar de nuevo
    if (nuevoEstado === "confirmada" || nuevoEstado === "en_curso" || nuevoEstado === "completada") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("vehiculos") as any)
        .update({ disponible: false })
        .eq("id", vehiculoId);
    } else if (nuevoEstado === "cancelada") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("vehiculos") as any)
        .update({ disponible: true })
        .eq("id", vehiculoId);
    }

    toast.success("Estado actualizado.");
    router.refresh();
    setLoading(false);
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
