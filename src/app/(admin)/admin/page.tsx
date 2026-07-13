import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/StatsCards";
import { DashboardMobileHeader } from "@/components/admin/DashboardMobileHeader";
import { formatCurrency, formatDate, ESTADOS_RESERVA } from "@/lib/utils";
import type { Metadata } from "next";
import { startOfMonth } from "date-fns";
import Link from "next/link";
import { CalendarCheck, Car, CheckCircle2, ChevronRight, DollarSign, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  const greetingName = user?.user_metadata?.nombre || user?.email?.split("@")[0] || "Administrador";
  const mobileStats = [
    { label: "Total vehículos", value: totalVehiculos ?? 0, icon: Car, colors: "bg-[#E7EEFB] text-[#2F63C7]" },
    { label: "Reservas pendientes", value: reservasPendientes ?? 0, icon: CalendarCheck, colors: "bg-[#FBEFCF] text-[#B27F00]" },
    { label: "Ingresos del mes", value: formatCurrency(ingresoesMes), icon: DollarSign, colors: "bg-[#E1F1E7] text-[#2E8B57]" },
    { label: "Disponibles", value: vehiculosDisponibles ?? 0, icon: CheckCircle2, colors: "bg-[#EAF6F1] text-[#17998C]" },
  ];

  return (
    <>
     <section className="-mx-5 -mt-4 bg-[#F5F1EB] pb-28 md:hidden">
        <DashboardMobileHeader greetingName={greetingName} />

        <div className="space-y-4 px-4 pt-[18px]">
          <Link href="/admin/reservas" className="flex items-center gap-3 rounded-[18px] border border-[#F1E0B0] bg-[linear-gradient(100deg,#FBEFCF,#FCF5E1)] p-3.5 text-[#14263F]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F2A83B] text-white"><CalendarCheck className="size-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold">{reservasPendientes ?? 0} reservas pendientes</span>
              <span className="block text-[12.5px] text-[#8A6B2E]">Requieren tu revisión hoy</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-[#8A6B2E]" />
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/reservas" className="rounded-[18px] bg-[#14263F] p-3.5 text-white">
              <span className="flex size-[38px] items-center justify-center rounded-[11px] bg-[#F2A83B] text-[#14263F]"><Plus className="size-5" strokeWidth={2.5} /></span>
              <span className="mt-3 block text-[13.5px] font-bold">Nueva reserva</span>
            </Link>
            <Link href="/admin/vehiculos/nuevo" className="rounded-[18px] border border-[#ECE6DD] bg-white p-3.5 text-[#14263F]">
              <span className="flex size-[38px] items-center justify-center rounded-[11px] bg-[#E7EEFB] text-[#2F63C7]"><Car className="size-5" /></span>
              <span className="mt-3 block text-[13.5px] font-bold">Agregar vehículo</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mobileStats.map((stat) => (
              <div key={stat.label} className="rounded-[20px] border border-[#ECE6DD] bg-white p-4">
                <span className={`flex size-[42px] items-center justify-center rounded-[13px] ${stat.colors}`}><stat.icon className="size-5" /></span>
                <p className="mt-3 text-[12.5px] font-medium text-[#7B8794]">{stat.label}</p>
                <p className="mt-0.5 text-[24px] font-extrabold leading-tight text-[#14263F]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-0.5 pt-2">
            <h2 className="text-[17px] font-extrabold text-[#14263F]">Últimas reservas</h2>
            <Link href="/admin/reservas" className="text-[13px] font-bold text-[#C2562B]">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {(reservasRecientes ?? []).map((r) => {
              const status = ESTADOS_RESERVA.find((e) => e.value === r.estado);
              const initials = r.nombre_cliente.split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("").toUpperCase();
              const pending = r.estado === "pendiente";
              return (
                <article key={r.id} className="rounded-[18px] border border-[#ECE6DD] bg-white p-[15px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1F6] text-sm font-extrabold text-[#14263F]">{initials || "CL"}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-bold text-[#14263F]">{r.nombre_cliente}</p>
                        <p className="mt-0.5 text-xs text-[#7B8794]">{formatDate(r.fecha_inicio)} - {formatDate(r.fecha_fin)}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${pending ? "bg-[#FBEFCF] text-[#8A6400]" : "bg-[#DDF1E3] text-[#217A46]"}`}>{status?.label ?? r.estado}</span>
                  </div>
                  <div className="my-3 h-px bg-[#F1ECE3]" />
                  <div className="flex items-center justify-between"><span className="text-xs text-[#7B8794]">Total</span><span className="text-base font-extrabold text-[#C2562B]">{formatCurrency(r.total)}</span></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="hidden space-y-6 lg:space-y-8 md:block">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">Resumen general del negocio</p>
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
      </div>
      </div>
    </>
  );
}
