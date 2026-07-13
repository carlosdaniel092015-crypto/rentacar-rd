import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NuevaReservaForm } from "@/components/admin/NuevaReservaForm";

export const metadata: Metadata = { title: "Nueva reserva | Admin" };
export const dynamic = "force-dynamic";

export default async function NuevaReservaPage() {
  const supabase = await createClient();
  const { data: vehiculos } = await supabase
    .from("vehiculos")
    .select("id, nombre, precio_dia")
    .eq("disponible", true)
    .order("nombre");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/reservas"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft className="size-4" /> Volver a reservas
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nueva reserva</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          Crea una reserva manualmente. Se valida disponibilidad y se notifica al cliente.
        </p>
      </div>

      <NuevaReservaForm vehiculos={(vehiculos ?? []) as { id: string; nombre: string; precio_dia: number }[]} />
    </div>
  );
}
