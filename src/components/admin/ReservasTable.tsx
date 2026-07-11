"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArchiveRestore, Archive, Plus } from "lucide-react";
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

const FILTROS_ESTADO = [
  { label: "Todas", value: "todas" },
  ...ESTADOS_RESERVA.map((e) => ({ label: e.label, value: e.value })),
];

type Vista = "activas" | "archivadas";

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ReservasTable({
  activas,
  archivadas,
}: {
  activas: Reserva[];
  archivadas: Reserva[];
}) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>("activas");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [procesando, setProcesando] = useState<string | null>(null);

  const reservas = vista === "activas" ? activas : archivadas;
  const filtradas =
    filtroEstado === "todas" ? reservas : reservas.filter((r) => r.estado === filtroEstado);

  const llamarApi = async (
    id: string,
    accion: "archivar" | "restaurar" | "eliminar_permanente",
    mensajeOk: string
  ) => {
    setProcesando(id);
    try {
      const res = await fetch(`/api/admin/reservas/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      if (!res.ok) { toast.error("Error en la operación."); return; }
      toast.success(mensajeOk);
      router.refresh();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setProcesando(null);
    }
  };

  const archivar = (r: Reserva) => {
    if (!confirm(`¿Archivar la reserva de ${r.nombre_cliente}?`)) return;
    llamarApi(r.id, "archivar", "Reserva archivada.");
  };

  const restaurar = (r: Reserva) => llamarApi(r.id, "restaurar", "Reserva restaurada.");

  const eliminarPermanente = (r: Reserva) => {
    if (!confirm(`¿Eliminar permanentemente la reserva de ${r.nombre_cliente}? Esto no se puede deshacer.`)) return;
    llamarApi(r.id, "eliminar_permanente", "Reserva eliminada permanentemente.");
  };

  const estadoBadge = (estado: EstadoReserva) => (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
      ESTADOS_RESERVA.find((e) => e.value === estado)?.color ?? ""
    }`}>
      {ESTADOS_RESERVA.find((e) => e.value === estado)?.label ?? estado}
    </span>
  );

  const acciones = (r: Reserva) =>
    vista === "activas" ? (
      <button
        onClick={() => archivar(r)}
        disabled={procesando === r.id}
        title="Archivar reserva"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-40"
      >
        <Archive className="size-4" /> Archivar
      </button>
    ) : (
      <>
        <button
          onClick={() => restaurar(r)}
          disabled={procesando === r.id}
          title="Restaurar reserva"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-40"
        >
          <ArchiveRestore className="size-4" /> Restaurar
        </button>
        <button
          onClick={() => eliminarPermanente(r)}
          disabled={procesando === r.id}
          title="Eliminar permanentemente"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--color-destructive)] bg-[var(--color-destructive)]/10 hover:bg-[var(--color-destructive)]/20 transition-colors disabled:opacity-40"
        >
          <Trash2 className="size-4" /> Eliminar
        </button>
      </>
    );

  return (
    <div className="space-y-4">
      {/* Encabezado de acciones: crear reserva manual (web y móvil) */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-muted)] w-fit">
          {(["activas", "archivadas"] as Vista[]).map((v) => (
            <button
              key={v}
              onClick={() => { setVista(v); setFiltroEstado("todas"); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                vista === v
                  ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {v === "activas" ? `Activas (${activas.length})` : `Archivadas (${archivadas.length})`}
            </button>
          ))}
        </div>

        <Link
          href="/admin/reservas/nueva"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" /> Nueva reserva
        </Link>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {FILTROS_ESTADO.map((f) => {
          const count =
            f.value === "todas"
              ? reservas.length
              : reservas.filter((r) => r.estado === f.value).length;
          if (count === 0 && f.value !== "todas") return null;
          return (
            <button
              key={f.value}
              onClick={() => setFiltroEstado(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                filtroEstado === f.value
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
          {vista === "archivadas" ? "No hay reservas archivadas." : "No hay reservas con este estado."}
        </div>
      ) : (
        <>
          {/* ── Vista MÓVIL: tarjetas (estado y acciones siempre accesibles) ── */}
          <div className="md:hidden space-y-3">
            {filtradas.map((r) => (
              <div
                key={r.id}
                className={`rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3 ${
                  vista === "archivadas" ? "opacity-80" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 size-11 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm">
                    {iniciales(r.nombre_cliente)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{r.nombre_cliente}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)] truncate">{r.email_cliente}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {r.vehiculos?.nombre ?? "—"} · {r.dias} día{r.dias !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {vista === "activas" ? (
                      <ReservaEstadoSelect reservaId={r.id} vehiculoId={r.vehiculo_id} estadoActual={r.estado} />
                    ) : (
                      estadoBadge(r.estado)
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">
                    {formatDate(r.fecha_inicio)} → {formatDate(r.fecha_fin)}
                  </span>
                  <span className="font-bold text-[var(--color-accent)]">{formatCurrency(r.total)}</span>
                </div>

                {r.notas && (
                  <p className="text-xs text-[var(--color-muted-foreground)] italic border-t border-[var(--color-border)] pt-2">{r.notas}</p>
                )}

                <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--color-border)]">
                  {acciones(r)}
                </div>
              </div>
            ))}
          </div>

          {/* ── Vista ESCRITORIO: tabla ── */}
          <div className="hidden md:block rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-muted)]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Vehículo</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Fechas</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Estado</th>
                    <th className="px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filtradas.map((r) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-[var(--color-muted)]/30 ${vista === "archivadas" ? "opacity-70" : ""}`}
                    >
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
                        {vista === "activas" ? (
                          <ReservaEstadoSelect
                            reservaId={r.id}
                            vehiculoId={r.vehiculo_id}
                            estadoActual={r.estado}
                          />
                        ) : (
                          estadoBadge(r.estado)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {acciones(r)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
