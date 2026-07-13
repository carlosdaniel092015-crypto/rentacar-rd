import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, Phone, Mail, CreditCard, FileText, CalendarCheck } from "lucide-react";
import { ContactoEditInline } from "@/components/admin/ContactoEditInline";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("contactos").select("nombre").eq("id", id).single() as any;
  return { title: data ? `${data.nombre} | Contactos` : "Contacto | Admin" };
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente:  { label: "Pendiente",  color: "bg-amber-100 text-amber-700" },
  confirmada: { label: "Confirmada", color: "bg-blue-100 text-blue-700" },
  en_curso:   { label: "En curso",   color: "bg-indigo-100 text-indigo-700" },
  completada: { label: "Completada", color: "bg-green-100 text-green-700" },
  cancelada:  { label: "Cancelada",  color: "bg-red-100 text-red-700" },
};

export default async function ContactoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: contacto }, { data: reservas }] = await Promise.all([
    supabase.from("contactos").select("*").eq("id", id).single() as any,
    supabase
      .from("reservas")
      .select("id, fecha_inicio, fecha_fin, dias, precio_dia, total, estado, created_at, vehiculos(nombre, imagen_url)")
      .eq("contacto_id", id)
      .order("created_at", { ascending: false }) as any,
  ]);

  if (!contacto) notFound();

  const rs: any[] = reservas ?? [];
  const totalGastado = rs.filter((r: any) => r.estado === "completada").reduce((s: number, r: any) => s + (r.total ?? 0), 0);
  const totalReservas = rs.length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/contactos"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] mb-3"
        >
          <ChevronLeft className="size-4" /> Contactos
        </Link>
        <h1 className="text-2xl font-bold">{contacto.nombre}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: info + edición */}
        <div className="lg:col-span-1 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-accent)]">{totalReservas}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Reservas</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
              <p className="text-lg font-bold text-green-600">{totalGastado > 0 ? formatCurrency(totalGastado) : "—"}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Total gastado</p>
            </div>
          </div>

          {/* Datos del contacto */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3">
            <h2 className="font-semibold text-sm">Información de contacto</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <Phone className="size-4 text-[var(--color-muted-foreground)] shrink-0 mt-0.5" />
                <span>{contacto.telefono}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="size-4 text-[var(--color-muted-foreground)] shrink-0 mt-0.5" />
                <span>{contacto.email || <span className="text-[var(--color-muted-foreground)]">Sin correo</span>}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CreditCard className="size-4 text-[var(--color-muted-foreground)] shrink-0 mt-0.5" />
                <span className="font-mono text-xs">{contacto.cedula}</span>
              </div>
              {contacto.notas && (
                <div className="flex items-start gap-2.5">
                  <FileText className="size-4 text-[var(--color-muted-foreground)] shrink-0 mt-0.5" />
                  <span className="text-[var(--color-muted-foreground)]">{contacto.notas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edición inline */}
          <ContactoEditInline contacto={contacto} />
        </div>

        {/* Panel derecho: historial de reservas */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
              <CalendarCheck className="size-4 text-[var(--color-muted-foreground)]" />
              <h2 className="font-semibold">Historial de reservas</h2>
            </div>
            {rs.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--color-muted-foreground)]">
                Este cliente aún no tiene reservas.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {rs.map((r: any) => {
                  const est = ESTADO_LABELS[r.estado] ?? { label: r.estado, color: "bg-gray-100 text-gray-600" };
                  const vehiculoNombre = r.vehiculos?.nombre ?? "Vehículo desconocido";
                  return (
                    <div key={r.id} className="px-5 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{vehiculoNombre}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${est.color}`}>
                            {est.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          {new Date(r.fecha_inicio).toLocaleDateString("es-DO")} →{" "}
                          {new Date(r.fecha_fin).toLocaleDateString("es-DO")} · {r.dias} día{r.dias !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(r.total)}</p>
                        <Link
                          href={`/admin/reservas`}
                          className="text-xs text-[var(--color-accent)] hover:underline"
                        >
                          #{r.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
