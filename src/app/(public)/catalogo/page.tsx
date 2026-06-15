import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VehicleGrid } from "@/components/catalogo/VehicleGrid";
import { VehicleFilters } from "@/components/catalogo/VehicleFilters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Catálogo de Vehículos",
  description: "Explora nuestra flota completa. SUVs, pickup, económicos y más.",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const { data: vehiculos, error } = await supabase
    .from("vehiculos")
    .select("*")
    .order("precio_dia", { ascending: true });

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">
          Error cargando los vehículos. Intenta más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Catálogo de vehículos</h1>
        <p className="text-[var(--color-muted-foreground)] mt-1">
          Toda nuestra flota disponible para ti
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filtros — desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <VehicleFilters />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Botón filtros mobile */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="size-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 pt-10">
                <VehicleFilters />
              </SheetContent>
            </Sheet>
          </div>

          <VehicleGrid vehiculos={vehiculos ?? []} />
        </div>
      </div>
    </div>
  );
}
