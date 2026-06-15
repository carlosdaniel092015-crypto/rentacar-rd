import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, ESTADOS_RESERVA } from "@/lib/utils";
import { ReservaEstadoSelect } from "@/components/admin/ReservaEstadoSelect";

export const metadata: Metadata = { title: "Reservas | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const supabase = await createClient();
  type ReservaConVehiculo = {
    id: string; vehiculo_id: string; nombre_cliente: string; email_cliente: string;
    telefono_cliente: string; cedula_cliente: string; fecha_inicio: string; fecha_fin: string;
    dias: number; precio_dia: number; total: number;
    estado: "pendiente" | "confirmada" | "en_curso" | "completada" | "cancelada";
    notas: string | null; created_at: string; updated_at: string; vehiculos: { nombre: string } | null;
  };
  const { data: reservasRaw } = await supabase
    .from("reservas")
    .select("*, vehiculos(nombre)")
    .order("created_at", { ascending: false });
  const reservas = reservasRaw as ReservaConVehiculo[] | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reservas</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          {reservas?.length ?? 0} reservas en total
        </p>
      </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(reservas ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-muted)]/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.nombre_cliente}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{r.email_cliente}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{r.cedula_cliente}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                    {(r.vehiculos as { nombre: string } | null)?.nombre ?? "—"}
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
                    <ReservaEstadoSelect reservaId={r.id} estadoActual={r.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
