import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, CalendarCheck, Car, Star } from "lucide-react";

export const metadata: Metadata = { title: "Analítica | Admin" };
export const dynamic = "force-dynamic";

export default async function AnaliticaPage() {
  const supabase = await createClient();

  const { data: reservas } = await supabase
    .from("reservas")
    .select("id,estado,total,dias,precio_dia,created_at,vehiculo_id,encuesta_estrellas,vehiculos(nombre)")
    .eq("archivada", false)
    .order("created_at", { ascending: false }) as any;

  const rs: any[] = reservas ?? [];

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalReservas = rs.length;
  const ingresoTotal = rs.filter(r => r.estado === "completada").reduce((s: number, r: any) => s + (r.total ?? 0), 0);
  const confirmadas = rs.filter(r => r.estado === "confirmada").length;
  const completadas = rs.filter(r => r.estado === "completada").length;
  const canceladas = rs.filter(r => r.estado === "cancelada").length;
  const pendientes = rs.filter(r => r.estado === "pendiente").length;
  const enCurso = rs.filter(r => r.estado === "en_curso").length;

  const conEncuesta = rs.filter(r => r.encuesta_estrellas != null);
  const promedioEstrellas = conEncuesta.length > 0
    ? conEncuesta.reduce((s: number, r: any) => s + r.encuesta_estrellas, 0) / conEncuesta.length
    : null;

  // ── Ingresos por mes (últimos 6 meses) ───────────────────────────────────
  const ahora = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("es-DO", { month: "short", year: "2-digit" }), total: 0 };
  });
  for (const r of rs.filter(r => r.estado === "completada")) {
    const m = (r.created_at as string).slice(0, 7);
    const found = meses.find(x => x.key === m);
    if (found) found.total += r.total ?? 0;
  }
  const maxMes = Math.max(...meses.map(m => m.total), 1);

  // ── Top vehículos ────────────────────────────────────────────────────────
  const vehicMap = new Map<string, { nombre: string; count: number; ingreso: number }>();
  for (const r of rs) {
    const nombre = r.vehiculos?.nombre ?? "Desconocido";
    const prev = vehicMap.get(r.vehiculo_id) ?? { nombre, count: 0, ingreso: 0 };
    vehicMap.set(r.vehiculo_id, { nombre, count: prev.count + 1, ingreso: prev.ingreso + (r.estado === "completada" ? r.total : 0) });
  }
  const topVehiculos = Array.from(vehicMap.values()).sort((a, b) => b.count - a.count).slice(0, 5);

  // ── Distribución por estado ───────────────────────────────────────────────
  const estados = [
    { label: "Completadas", count: completadas, color: "bg-green-500" },
    { label: "Confirmadas", count: confirmadas, color: "bg-blue-500" },
    { label: "En curso", count: enCurso, color: "bg-indigo-500" },
    { label: "Pendientes", count: pendientes, color: "bg-amber-500" },
    { label: "Canceladas", count: canceladas, color: "bg-red-500" },
  ].filter(e => e.count > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="hidden text-2xl font-bold md:block">Analítica</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">Rendimiento general del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: CalendarCheck, label: "Total reservas", value: String(totalReservas), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Ingresos completados", value: formatCurrency(ingresoTotal), color: "text-green-600", bg: "bg-green-50" },
          { icon: Car, label: "Completadas", value: String(completadas), color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: Star, label: "Satisfacción promedio", value: promedioEstrellas ? `${promedioEstrellas.toFixed(1)} / 5` : "Sin datos", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex items-start gap-3">
            <div className={`p-2 rounded-lg ${kpi.bg} shrink-0`}>
              <kpi.icon className={`size-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-foreground)]">{kpi.label}</p>
              <p className="text-xl font-bold mt-0.5">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ingresos por mes */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold mb-6">Ingresos por mes (completadas)</h2>
          <div className="space-y-3">
            {meses.map((m) => (
              <div key={m.key} className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-muted-foreground)] w-12 shrink-0">{m.label}</span>
                <div className="flex-1 h-7 bg-[var(--color-muted)] rounded-md overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-md transition-all flex items-center px-2"
                    style={{ width: `${Math.max((m.total / maxMes) * 100, m.total > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-24 text-right shrink-0">{m.total > 0 ? formatCurrency(m.total) : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold mb-6">Distribución por estado</h2>
          {totalReservas === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Sin reservas aún.</p>
          ) : (
            <div className="space-y-3">
              {estados.map((e) => (
                <div key={e.label} className="flex items-center gap-3">
                  <div className={`size-3 rounded-full shrink-0 ${e.color}`} />
                  <span className="text-sm flex-1">{e.label}</span>
                  <div className="flex-1 h-5 bg-[var(--color-muted)] rounded-md overflow-hidden">
                    <div
                      className={`h-full ${e.color} rounded-md opacity-80`}
                      style={{ width: `${(e.count / totalReservas) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-16 text-right shrink-0">
                    {e.count} ({Math.round((e.count / totalReservas) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top vehículos + Encuestas */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold mb-4">Top vehículos por reservas</h2>
          {topVehiculos.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {topVehiculos.map((v, i) => (
                <div key={v.nombre} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--color-muted-foreground)] w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.nombre}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{v.count} reserva{v.count !== 1 ? "s" : ""} · {formatCurrency(v.ingreso)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold mb-4">Encuestas de satisfacción</h2>
          {conEncuesta.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Aún no hay encuestas completadas.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-amber-500">{promedioEstrellas!.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`size-4 ${n <= Math.round(promedioEstrellas!) ? "fill-amber-400 text-amber-400" : "text-[var(--color-border)]"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{conEncuesta.length} respuesta{conEncuesta.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {[5,4,3,2,1].map(n => {
                const count = conEncuesta.filter((r: any) => r.encuesta_estrellas === n).length;
                return (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{n}</span>
                    <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-4 bg-[var(--color-muted)] rounded-sm overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-sm" style={{ width: conEncuesta.length > 0 ? `${(count / conEncuesta.length) * 100}%` : "0%" }} />
                    </div>
                    <span className="w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
