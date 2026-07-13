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

  return (
    <div className="space-y-4">
      {/* Crear reserva manual (web y móvil) */}
      <Link
        href="/admin/reservas/nueva"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity w-full sm:w-auto"
      >
        <Plus className="size-4" /> Nueva reserva
      </Link>

      {/* Pestañas Activas / Archivadas */}
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
          <div className="space-y-3 md:hidden">
            {filtradas.map((r) => {
              const status = ESTADOS_RESERVA.find((e) => e.value === r.estado);
              const initials = r.nombre_cliente.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
              const pending = r.estado === "pendiente";
              return (
                <article key={r.id} className={`rounded-[18px] border border-[#ECE6DD] bg-white p-[15px] ${vista === "archivadas" ? "opacity-70" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1F6] text-sm font-extrabold text-[#14263F]">{initials || "CL"}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-bold text-[#14263F]">{r.nombre_cliente}</p>
                        <p className="mt-0.5 text-xs text-[#7B8794]">{formatDate(r.fecha_inicio)} - {formatDate(r.fecha_fin)}</p>
                      </div>
                    </div>
                    {vista === "activas" ? (
                      <div className="shrink-0">
                        <ReservaEstadoSelect reservaId={r.id} vehiculoId={r.vehiculo_id} estadoActual={r.estado} />
                      </div>
                    ) : (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${pending ? "bg-[#FBEFCF] text-[#8A6400]" : "bg-[#DDF1E3] text-[#217A46]"}`}>{status?.label ?? r.estado}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#7B8794]">{r.vehiculos?.nombre ?? "Vehículo"} · {r.dias} día{r.dias !== 1 ? "s" : ""}</p>
                  <div className="my-3 h-px bg-[#F1ECE3]" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#7B8794]">Total</span>
                    <span className="text-base font-extrabold text-[#C2562B]">{formatCurrency(r.total)}</span>
                  </div>
                  {/* Acciones accesibles en móvil (antes solo estaban en la tabla de escritorio) */}
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#F1ECE3] pt-3">
                    {vista === "activas" ? (
                      <button
                        onClick={() => archivar(r)}
                        disabled={procesando === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#FBF3E3] px-3 py-2 text-xs font-semibold text-[#8A6400] disabled:opacity-40"
                      >
                        <Archive className="size-4" /> Archivar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => restaurar(r)}
                          disabled={procesando === r.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDF1E3] px-3 py-2 text-xs font-semibold text-[#217A46] disabled:opacity-40"
                        >
                          <ArchiveRestore className="size-4" /> Restaurar
                        </button>
                        <button
                          onClick={() => eliminarPermanente(r)}
                          disabled={procesando === r.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FBE4E0] px-3 py-2 text-xs font-semibold text-[var(--color-destructive)] disabled:opacity-40"
                        >
                          <Trash2 className="size-4" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] md:block">
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
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          ESTADOS_RESERVA.find((e) => e.value === r.estado)?.color ?? ""
                        }`}>
                          {ESTADOS_RESERVA.find((e) => e.value === r.estado)?.label ?? r.estado}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {vista === "activas" ? (
                          <button
                            onClick={() => archivar(r)}
                            disabled={procesando === r.id}
                            title="Archivar reserva"
                            className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                          >
                            <Archive className="size-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => restaurar(r)}
                              disabled={procesando === r.id}
                              title="Restaurar reserva"
                              className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                            >
                              <ArchiveRestore className="size-4" />
                            </button>
                            <button
                              onClick={() => eliminarPermanente(r)}
                              disabled={procesando === r.id}
                              title="Eliminar permanentemente"
                              className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors disabled:opacity-40"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
