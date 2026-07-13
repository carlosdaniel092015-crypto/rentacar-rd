import type { Metadata } from "next";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata: Metadata = { title: "Nuevo Vehículo | Admin" };

export default function NuevoVehiculoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo vehículo</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">Agrega un nuevo vehículo a la flota</p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <VehicleForm mode="create" />
      </div>
    </div>
  );
}
