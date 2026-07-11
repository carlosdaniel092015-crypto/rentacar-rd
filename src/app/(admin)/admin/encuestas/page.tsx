import { Metadata } from "next";
import { Star } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Encuestas | Alma 3D Rent Card Admin" };
export const dynamic = "force-dynamic";

function Estrellas({ n, size = "sm" }: { n: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "size-5" : "size-3.5";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= n ? "fill-amber-400 text-amber-400" : "text-[var(--color-border)]"}`}
        />
      ))}
    </span>
  );
}

export default async function EncuestasPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: raw } = await supabase
    .from("reservas")
    .select("id, nombre_cliente, email_cliente, encuesta_estrellas, encuesta_comentario, encuesta_fecha, vehiculos(nombre)")
    .not("encuesta_estrellas", "is", null)
    .order("encuesta_fecha", { ascending: false });

  const encuestas: any[] = raw ?? [];

  const total = encuestas.length;
  const promedio = total > 0
    ? encuestas.reduce((s: number, e: any) => s + e.encuesta_estrellas, 0) / total
    : 0;

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: encuestas.filter((e: any) => e.encuesta_estrellas === n).length,
  }));

  const etiquetas: Record<number, string> = {
    1: "Muy malo", 2: "Malo", 3: "Regular", 4: "Bueno", 5: "Excelente",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Encuestas de satisfacción</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          Opiniones enviadas por clientes al completar su alquiler
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Respuestas totales</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
          <p className="text-3xl font-bold text-amber-500">{promedio.toFixed(1)}</p>
          <div className="flex justify-center mt-1">
            <Estrellas n={Math.round(promedio)} />
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Promedio</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium mb-3 text-[var(--color-muted-foreground)]">Distribución</p>
          <div className="space-y-1.5">
            {dist.map(({ n, count }) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right text-[var(--color-muted-foreground)]">{n}</span>
                <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 bg-[var(--color-muted)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-4 text-right text-[var(--color-muted-foreground)]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de respuestas */}
      {encuestas.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <Star className="size-10 text-[var(--color-border)] mx-auto mb-3" />
          <p className="font-medium">Aún no hay respuestas</p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Las encuestas se envían automáticamente cuando completas un alquiler
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-muted)]/50 border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]">Vehículo</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]">Calificación</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]">Comentario</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {encuestas.map((e: any) => (
                  <tr key={e.id} className="hover:bg-[var(--color-muted)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.nombre_cliente}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{e.email_cliente}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      {e.vehiculos?.nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Estrellas n={e.encuesta_estrellas} />
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {etiquetas[e.encuesta_estrellas as number]}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {e.encuesta_comentario ? (
                        <p className="text-sm line-clamp-2 text-[var(--color-foreground)]">{e.encuesta_comentario}</p>
                      ) : (
                        <span className="text-xs text-[var(--color-muted-foreground)]">Sin comentario</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-muted-foreground)] whitespace-nowrap">
                      {e.encuesta_fecha
                        ? new Date(e.encuesta_fecha).toLocaleDateString("es-DO", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
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
