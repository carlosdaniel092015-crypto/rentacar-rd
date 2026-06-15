import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import type { Vehiculo, Categoria } from "@/types/database.types";
import { VehiculoActions } from "@/components/admin/VehiculoActions";

export const metadata: Metadata = { title: "Vehículos | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminVehiculosPage() {
  const supabase = await createClient();
  const [{ data: vehiculosRaw }, { data: categoriasList }] = await Promise.all([
    supabase.from("vehiculos").select("*").order("created_at", { ascending: false }),
    supabase.from("categorias").select("*"),
  ]);
  const vehiculos = vehiculosRaw as Vehiculo[] | null;
  const categorias = (categoriasList ?? []) as Categoria[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehículos</h1>
          <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
            {vehiculos?.length ?? 0} vehículos en la flota
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/admin/vehiculos/nuevo" className="flex items-center gap-2">
            <Plus className="size-4" />
            Nuevo vehículo
          </Link>
        </Button>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Vehículo</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Precio/día</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(vehiculos ?? []).map((v) => {
                const categoriaLabel = categorias.find((c) => c.slug === v.categoria)?.nombre ?? v.categoria;
                return (
                  <tr key={v.id} className="hover:bg-[var(--color-muted)]/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-[var(--radius)] overflow-hidden bg-[var(--color-muted)] shrink-0">
                          {v.imagen_url && (
                            <Image src={v.imagen_url} alt={v.nombre} fill className="object-cover" sizes="48px" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{v.nombre}</p>
                          <p className="text-xs text-[var(--color-muted-foreground)]">{v.marca} · {v.anio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{categoriaLabel}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-accent)]">
                      {formatCurrency(v.precio_dia)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={v.disponible ? "success" : "destructive"}>
                        {v.disponible ? "Disponible" : "No disponible"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <VehiculoActions vehiculoId={v.id} disponible={v.disponible} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
