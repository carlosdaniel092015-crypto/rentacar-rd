"use client";

import { useFiltrosStore } from "@/store/filtros.store";
import { CATEGORIAS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CategoriaVehiculo } from "@/lib/utils";

export function VehicleFilters() {
  const {
    categorias,
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

  const toggleCategoria = (cat: CategoriaVehiculo) => {
    if (categorias.includes(cat)) {
      setCategorias(categorias.filter((c) => c !== cat));
    } else {
      setCategorias([...categorias, cat]);
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

      {/* Categoría */}
      <div>
        <Label className="block mb-3 text-sm font-medium">Categoría</Label>
        <div className="space-y-2">
          {CATEGORIAS.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={categorias.includes(cat.value)}
                onChange={() => toggleCategoria(cat.value)}
                className="size-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <span className="text-sm">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

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

      {/* Pasajeros */}
      <div>
        <Label className="block mb-3 text-sm font-medium">Pasajeros</Label>
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
              <span className="text-sm">{p === "todos" ? "Todos" : `${p} pasajeros`}</span>
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
          max={20000}
          step={500}
          value={precioMax}
          onChange={(e) => setPrecioMax(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="flex justify-between text-xs text-[var(--color-muted-foreground)] mt-1">
          <span>RD$500</span>
          <span>RD$20,000</span>
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
