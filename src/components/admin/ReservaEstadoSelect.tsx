"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ESTADOS_RESERVA } from "@/lib/utils";
import type { EstadoReserva } from "@/lib/utils";

interface ReservaEstadoSelectProps {
  reservaId: string;
  estadoActual: EstadoReserva;
}

export function ReservaEstadoSelect({ reservaId, estadoActual }: ReservaEstadoSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (nuevoEstado: EstadoReserva) => {
    if (nuevoEstado === estadoActual) return;
    setLoading(true);
    const supabase = createClient();
    const payload: Record<string, unknown> = { estado: nuevoEstado };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("reservas") as any).update(payload).eq("id", reservaId);

    if (error) {
      toast.error("Error actualizando estado.");
    } else {
      toast.success("Estado actualizado.");
      router.refresh();
    }
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
