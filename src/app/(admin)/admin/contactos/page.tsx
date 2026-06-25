import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Contactos | Admin" };
export const dynamic = "force-dynamic";

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("contactos")
    .select("id, nombre, telefono, cedula, email, created_at")
    .order("nombre");

  if (q.trim()) {
    query = query.or(
      `nombre.ilike.%${q.trim()}%,telefono.ilike.%${q.trim()}%,cedula.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`
    );
  }

  const { data: contactos } = await query as any;
  const cs: any[] = contactos ?? [];

  // Stats de reservas por contacto
  const ids = cs.map((c: any) => c.id);
  let statsMap = new Map<string, { count: number; total: number }>();
  if (ids.length > 0) {
    const { data: reservas } = await supabase
      .from("reservas")
      .select("contacto_id, total, estado")
      .in("contacto_id", ids) as any;
    for (const r of reservas ?? []) {
      const prev = statsMap.get(r.contacto_id) ?? { count: 0, total: 0 };
      statsMap.set(r.contacto_id, {
        count: prev.count + 1,
        total: prev.total + (r.estado === "completada" ? (r.total ?? 0) : 0),
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            {cs.length} cliente{cs.length !== 1 ? "s" : ""} registrado{cs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild variant="accent" size="sm">
          <Link href="/admin/contactos/nuevo">
            <Plus className="size-4 mr-1.5" /> Nuevo contacto
          </Link>
        </Button>
      </div>

      {/* Buscador */}
      <form method="GET" className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted-foreground)]" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, teléfono, cédula..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </form>

      {cs.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border)] p-16 text-center">
          <Users className="size-10 mx-auto text-[var(--color-muted-foreground)] mb-3" />
          <p className="font-semibold text-[var(--color-muted-foreground)]">
            {q ? "Sin resultados" : "Aún no hay contactos"}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            {q ? "Prueba otro término de búsqueda." : "Los contactos se crean automáticamente cuando alguien hace una reserva."}
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)] hidden sm:table-cell">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)] hidden md:table-cell">Cédula / Pasaporte</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Reservas</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--color-muted-foreground)] hidden sm:table-cell">Total gastado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {cs.map((c: any) => {
                  const stats = statsMap.get(c.id) ?? { count: 0, total: 0 };
                  return (
                    <tr key={c.id} className="hover:bg-[var(--color-muted)]/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.nombre}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">{c.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[var(--color-muted-foreground)]">{c.telefono}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-[var(--color-muted-foreground)] font-mono text-xs">{c.cedula}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold">
                          {stats.count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell font-medium">
                        {stats.total > 0 ? formatCurrency(stats.total) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/contactos/${c.id}`}
                          className="text-xs text-[var(--color-accent)] hover:underline font-medium"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
