"use client";

import { create } from "zustand";

interface ReservaDraft {
  vehiculoId: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  setVehiculo: (id: string) => void;
  setFechas: (inicio: Date | null, fin: Date | null) => void;
  limpiar: () => void;
}

export const useReservaStore = create<ReservaDraft>((set) => ({
  vehiculoId: null,
  fechaInicio: null,
  fechaFin: null,
  setVehiculo: (vehiculoId) => set({ vehiculoId }),
  setFechas: (fechaInicio, fechaFin) => set({ fechaInicio, fechaFin }),
  limpiar: () => set({ vehiculoId: null, fechaInicio: null, fechaFin: null }),
}));
