"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFiltrosStore } from "@/store/filtros.store";
import { VehicleCard } from "./VehicleCard";
import type { Vehiculo } from "@/types/database.types";

interface VehicleGridProps {
  vehiculos: Vehiculo[];
}

export function VehicleGrid({ vehiculos }: VehicleGridProps) {
  const { categorias, transmision, pasajeros, precioMax, soloDisponibles } = useFiltrosStore();

  const filtrados = useMemo(() => {
    return vehiculos.filter((v) => {
      if (soloDisponibles && !v.disponible) return false;
      if (categorias.length > 0 && !categorias.includes(v.categoria)) return false;
      if (transmision !== "todos" && v.transmision !== transmision) return false;
      if (v.precio_dia > precioMax) return false;
      if (pasajeros === "2-4" && (v.pasajeros < 2 || v.pasajeros > 4)) return false;
      if (pasajeros === "5-7" && (v.pasajeros < 5 || v.pasajeros > 7)) return false;
      if (pasajeros === "8+" && v.pasajeros < 8) return false;
      return true;
    });
  }, [vehiculos, categorias, transmision, pasajeros, precioMax, soloDisponibles]);

  if (filtrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h3 className="text-lg font-semibold mb-2">No encontramos vehículos</h3>
        <p className="text-[var(--color-muted-foreground)] text-sm max-w-xs">
          Prueba ajustando los filtros o ampliando el rango de precios.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
        {filtrados.length} {filtrados.length === 1 ? "vehículo" : "vehículos"} disponible{filtrados.length !== 1 ? "s" : ""}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((vehiculo, i) => (
          <motion.div
            key={vehiculo.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <VehicleCard vehiculo={vehiculo} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
