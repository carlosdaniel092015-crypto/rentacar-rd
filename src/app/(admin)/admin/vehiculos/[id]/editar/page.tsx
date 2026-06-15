import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VehicleForm } from "@/components/admin/VehicleForm";
import type { Vehiculo } from "@/types/database.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editar Vehículo | Admin" };

export default async function EditarVehiculoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vehiculo } = await supabase.from("vehiculos").select("*").eq("id", id).single<Vehiculo>();

  if (!vehiculo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar vehículo</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">{vehiculo.nombre}</p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <VehicleForm vehiculo={vehiculo} mode="edit" />
      </div>
    </div>
  );
}
