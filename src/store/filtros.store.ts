"use client";

import { create } from "zustand";
import type { CategoriaVehiculo, TipoTransmision } from "@/lib/utils";

interface FiltrosState {
  categorias: CategoriaVehiculo[];
  transmision: TipoTransmision | "todos";
  pasajeros: "todos" | "2-4" | "5-7" | "8+";
  precioMax: number;
  soloDisponibles: boolean;
  setCategorias: (categorias: CategoriaVehiculo[]) => void;
  setTransmision: (transmision: TipoTransmision | "todos") => void;
  setPasajeros: (pasajeros: "todos" | "2-4" | "5-7" | "8+") => void;
  setPrecioMax: (precio: number) => void;
  setSoloDisponibles: (solo: boolean) => void;
  limpiarFiltros: () => void;
}

const DEFAULTS = {
  categorias: [] as CategoriaVehiculo[],
  transmision: "todos" as const,
  pasajeros: "todos" as const,
  precioMax: 500000,
  soloDisponibles: true,
};

export const useFiltrosStore = create<FiltrosState>((set) => ({
  ...DEFAULTS,
  setCategorias: (categorias) => set({ categorias }),
  setTransmision: (transmision) => set({ transmision }),
  setPasajeros: (pasajeros) => set({ pasajeros }),
  setPrecioMax: (precioMax) => set({ precioMax }),
  setSoloDisponibles: (soloDisponibles) => set({ soloDisponibles }),
  limpiarFiltros: () => set(DEFAULTS),
}));
