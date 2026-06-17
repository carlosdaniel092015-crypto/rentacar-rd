import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ReservasTable } from "@/components/admin/ReservasTable";

export const metadata: Metadata = { title: "Reservas | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const supabase = await createClient();

  const { data: todas } = await supabase
    .from("reservas")
    .select("*, vehiculos(nombre)")
    .order("created_at", { ascending: false });

  const activas = (todas ?? []).filter((r: any) => !r.archivada);
  const archivadas = (todas ?? []).filter((r: any) => r.archivada);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reservas</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          {activas.length} activas · {archivadas.length} archivadas
        </p>
      </div>

      <ReservasTable activas={activas as any} archivadas={archivadas as any} />
    </div>
  );
}
