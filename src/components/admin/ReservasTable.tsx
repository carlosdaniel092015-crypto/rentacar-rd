"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, ESTADOS_RESERVA } from "@/lib/utils";
import { ReservaEstadoSelect } from "./ReservaEstadoSelect";
import type { EstadoReserva } from "@/lib/utils";

type Reserva = {
  id: string;
  vehiculo_id: string;
  nombre_cliente: string;
  email_cliente: string;
  cedula_cliente: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias: number;
  total: number;
  estado: EstadoReserva;
  notas: string | null;
  vehiculos: { nombre: string } | null;
};

const FILTROS = [
  { label: "Todas", value: "todas" },
  ...ESTADOS_RESERVA.map((e) => ({ label: e.label, value: e.value })),
] as const;

export function ReservasTable({ reservas }: { reservas: Reserva[] }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<string>("todas");
  const [eliminando, setEliminando] = useState<string | null>(null);

  const filtradas =
    filtro === "todas" ? reservas : reservas.filter((r) => r.estado === filtro);

  const eliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la reserva de ${nombre}? Esta acción no se puede deshacer.`)) return;
    setEliminando(id);
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Error eliminando la reserva."); return; }
      toast.success("Reserva eliminada.");
      router.refresh();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const count = f.value === "todas"
            ? reservas.length
            : reservas.filter((r) => r.estado === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                filtro === f.value
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-transparent text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center text-sm text-[var(--color-muted-foreground)]">
          No hay reservas con este estado.
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-muted)]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Vehículo</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Fechas</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtradas.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--color-muted)]/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.nombre_cliente}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{r.email_cliente}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{r.cedula_cliente}</p>
                      {r.notas && (
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 italic">{r.notas}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      {r.vehiculos?.nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      <p>{formatDate(r.fecha_inicio)}</p>
                      <p>{formatDate(r.fecha_fin)}</p>
                      <p className="text-xs">{r.dias} día{r.dias !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-accent)]">
                      {formatCurrency(r.total)}
                    </td>
                    <td className="px-4 py-3">
                      <ReservaEstadoSelect
                        reservaId={r.id}
                        vehiculoId={r.vehiculo_id}
                        estadoActual={r.estado}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminar(r.id, r.nombre_cliente)}
                        disabled={eliminando === r.id}
                        title="Eliminar reserva"
                        className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
