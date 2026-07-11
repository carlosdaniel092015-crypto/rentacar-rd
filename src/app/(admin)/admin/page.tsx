import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/StatsCards";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, ESTADOS_RESERVA } from "@/lib/utils";
import type { Metadata } from "next";
import { startOfMonth } from "date-fns";

export const metadata: Metadata = { title: "Dashboard | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalVehiculos },
    { count: vehiculosDisponibles },
    { count: reservasPendientes },
    { data: reservasRecientesRaw },
    { data: ingresosData },
  ] = await Promise.all([
    supabase.from("vehiculos").select("*", { count: "exact", head: true }),
    supabase.from("vehiculos").select("*", { count: "exact", head: true }).eq("disponible", true),
    supabase.from("reservas").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("reservas").select("id, nombre_cliente, vehiculo_id, fecha_inicio, fecha_fin, total, estado, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("reservas").select("total").gte("created_at", startOfMonth(new Date()).toISOString()).in("estado", ["confirmada", "en_curso", "completada"]),
  ]);

  type ReservaRow = { id: string; nombre_cliente: string; vehiculo_id: string; fecha_inicio: string; fecha_fin: string; total: number; estado: string; created_at: string };
  const reservasRecientes = reservasRecientesRaw as ReservaRow[] | null;

  const ingresoesMes = (ingresosData as Array<{ total: number }> | null)?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl lg:text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--color-muted-foreground)] text-base lg:text-sm mt-1">Resumen general del negocio</p>
      </div>

      <StatsCards
        totalVehiculos={totalVehiculos ?? 0}
        reservasPendientes={reservasPendientes ?? 0}
        ingresoesMes={ingresoesMes}
        vehiculosDisponibles={vehiculosDisponibles ?? 0}
      />

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold">Últimas reservas</h2>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Fechas</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Total</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(reservasRecientes ?? []).map((r) => {
                const estadoConfig = ESTADOS_RESERVA.find((e) => e.value === r.estado);
                return (
                  <tr key={r.id} className="hover:bg-[var(--color-muted)]/50">
                    <td className="px-4 py-3 font-medium">{r.nombre_cliente}</td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      {formatDate(r.fecha_inicio)} — {formatDate(r.fecha_fin)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-accent)]">
                      {formatCurrency(r.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoConfig?.color ?? ""}`}>
                        {estadoConfig?.label ?? r.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-[var(--color-border)] md:hidden">
          {(reservasRecientes ?? []).map((r) => {
            const estadoConfig = ESTADOS_RESERVA.find((e) => e.value === r.estado);
            return (
              <article key={r.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-semibold leading-tight">{r.nombre_cliente}</p>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${estadoConfig?.color ?? ""}`}>
                    {estadoConfig?.label ?? r.estado}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
                    {formatDate(r.fecha_inicio)}<br />{formatDate(r.fecha_fin)}
                  </p>
                  <p className="text-xl font-bold text-[var(--color-accent)]">{formatCurrency(r.total)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
