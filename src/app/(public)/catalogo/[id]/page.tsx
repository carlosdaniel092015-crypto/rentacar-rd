import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users, Fuel, Zap, Calendar, CheckCircle2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ReservaForm } from "@/components/catalogo/ReservaForm";
import { VehicleGallery } from "@/components/catalogo/VehicleGallery";
import { formatCurrency, TRANSMISIONES, COMBUSTIBLES } from "@/lib/utils";
import type { Vehiculo, Categoria } from "@/types/database.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("vehiculos").select("nombre, descripcion").eq("id", id).single<{ nombre: string; descripcion: string | null }>();
  if (!data) return { title: "Vehículo no encontrado" };
  return {
    title: data.nombre,
    description: data.descripcion ?? `Reserva el ${data.nombre} en Alma 3D Rent Card.`,
  };
}

export const revalidate = 600;

export default async function VehiculoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehiculo } = await supabase.from("vehiculos").select("*").eq("id", id).single<Vehiculo>();
  const { data: categoriasList } = await supabase.from("categorias").select("*");
  const categorias = (categoriasList ?? []) as Categoria[];

  if (!vehiculo) notFound();

  const categoriaLabel = categorias.find((c: Categoria) => c.slug === vehiculo.categoria)?.nombre ?? vehiculo.categoria;
  const transmisionLabel = TRANSMISIONES.find((t) => t.value === vehiculo.transmision)?.label ?? vehiculo.transmision;
  const combustibleLabel = COMBUSTIBLES.find((c) => c.value === vehiculo.combustible)?.label ?? vehiculo.combustible;

  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18091234567";
  const waMsg = encodeURIComponent(`Hola, me interesa el ${vehiculo.nombre}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        {/* Galería interactiva */}
        <div className="space-y-4">
          <VehicleGallery
            id={vehiculo.id}
            nombre={vehiculo.nombre}
            imagenPrincipal={vehiculo.imagen_url}
            imagenesUrls={vehiculo.imagenes_urls ?? []}
          />

          {/* Info desktop */}
          <div className="hidden lg:block space-y-6 mt-6">
            <div>
              <h2 className="font-semibold mb-3">Características</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Users, label: "Filas de asientos", value: String(vehiculo.pasajeros) },
                  { icon: Zap, label: "Transmisión", value: transmisionLabel },
                  { icon: Fuel, label: "Combustible", value: combustibleLabel },
                  { icon: Calendar, label: "Año", value: String(vehiculo.anio) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3">
                    <item.icon className="size-5 text-[var(--color-accent)]" />
                    <div>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {vehiculo.caracteristicas.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Equipamiento</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {vehiculo.caracteristicas.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-[var(--color-success)] shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vehiculo.descripcion && (
              <div>
                <h2 className="font-semibold mb-2">Descripción</h2>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {vehiculo.descripcion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho — sticky */}
        <div className="mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <Badge variant="secondary">{categoriaLabel}</Badge>
                  <h1 className="text-2xl font-bold mt-2">{vehiculo.nombre}</h1>
                  <p className="text-[var(--color-muted-foreground)] text-sm">
                    {vehiculo.marca} · {vehiculo.anio}
                  </p>
                </div>
                <Badge variant={vehiculo.disponible ? "success" : "destructive"}>
                  {vehiculo.disponible ? "Disponible" : "No disponible"}
                </Badge>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-[var(--color-accent)]">
                  {formatCurrency(vehiculo.precio_dia)}
                </span>
                <span className="text-sm text-[var(--color-muted-foreground)]">/día</span>
              </div>
            </div>

            {/* Formulario de reserva */}
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="font-semibold mb-4">Hacer reserva</h2>
              <ReservaForm vehiculo={vehiculo} />
            </div>

            <a
              href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-[var(--radius-lg)] border-2 border-[#25D366] text-[#25D366] py-3 text-sm font-medium hover:bg-[#25D366]/10 transition-colors"
            >
              <MessageCircle className="size-5" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        {/* Info mobile (debajo del panel de reserva) */}
        <div className="lg:hidden mt-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-3">Características</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Filas de asientos", value: String(vehiculo.pasajeros) },
                { icon: Zap, label: "Transmisión", value: transmisionLabel },
                { icon: Fuel, label: "Combustible", value: combustibleLabel },
                { icon: Calendar, label: "Año", value: String(vehiculo.anio) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] p-3">
                  <item.icon className="size-5 text-[var(--color-accent)]" />
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {vehiculo.caracteristicas.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Equipamiento</h2>
              <ul className="grid grid-cols-2 gap-2">
                {vehiculo.caracteristicas.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-[var(--color-success)] shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vehiculo.descripcion && (
            <div>
              <h2 className="font-semibold mb-2">Descripción</h2>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{vehiculo.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
