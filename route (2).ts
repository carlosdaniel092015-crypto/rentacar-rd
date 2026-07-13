"use client";

import { useFiltrosStore } from "@/store/filtros.store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Categoria } from "@/types/database.types";

interface VehicleFiltersProps {
  categorias: Categoria[];
}

export function VehicleFilters({ categorias }: VehicleFiltersProps) {
  const {
    categorias: categoriasFiltro,
    transmision,
    pasajeros,
    precioMax,
    soloDisponibles,
    setCategorias,
    setTransmision,
    setPasajeros,
    setPrecioMax,
    setSoloDisponibles,
    limpiarFiltros,
  } = useFiltrosStore();

  const toggleCategoria = (slug: string) => {
    if (categoriasFiltro.includes(slug)) {
      setCategorias(categoriasFiltro.filter((c) => c !== slug));
    } else {
      setCategorias([...categoriasFiltro, slug]);
    }
  };

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-foreground)]">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="text-xs">
          Limpiar filtros
        </Button>
      </div>

      {/* Categoría dinámica */}
      {categorias.length > 0 && (
        <div>
          <Label className="block mb-3 text-sm font-medium">Categoría</Label>
          <div className="space-y-2">
            {categorias.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoriasFiltro.includes(cat.slug)}
                  onChange={() => toggleCategoria(cat.slug)}
                  className="size-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                <span className="text-sm">{cat.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Transmisión */}
      <div>
        <Label className="block mb-3 text-sm font-medium">Transmisión</Label>
        <div className="space-y-2">
          {(["todos", "manual", "automatica"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transmision"
                value={t}
                checked={transmision === t}
                onChange={() => setTransmision(t)}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span className="text-sm capitalize">{t === "todos" ? "Todas" : t === "automatica" ? "Automática" : "Manual"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filas de asientos */}
      <div>
        <Label className="block mb-3 text-sm font-medium">Filas de asientos</Label>
        <div className="space-y-2">
          {(["todos", "2-4", "5-7", "8+"] as const).map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pasajeros"
                value={p}
                checked={pasajeros === p}
                onChange={() => setPasajeros(p)}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span className="text-sm">{p === "todos" ? "Todas" : `${p} asientos`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Precio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">Precio máximo/día</Label>
          <span className="text-sm font-semibold text-[var(--color-accent)]">
            RD${precioMax.toLocaleString("es-DO")}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={500000}
          step={1000}
          value={precioMax}
          onChange={(e) => setPrecioMax(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--color-muted-foreground)] mt-1">
          <span>RD$500</span>
          <span>RD$500,000</span>
        </div>
      </div>

      {/* Solo disponibles */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={soloDisponibles}
          onChange={(e) => setSoloDisponibles(e.target.checked)}
          className="size-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
        />
        <span className="text-sm font-medium">Solo disponibles</span>
      </label>
    </aside>
  );
}
