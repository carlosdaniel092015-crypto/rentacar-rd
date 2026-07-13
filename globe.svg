import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { GpsConfigForm } from "@/components/admin/GpsConfigForm";
import { GpsMap } from "@/components/admin/GpsMap";

export const metadata: Metadata = { title: "GPS / Flota | Admin" };
export const dynamic = "force-dynamic";

export default async function GpsPage() {
  const supabase = createAdminClient() as any;
  const { data: config } = await supabase
    .from("gps_configuracion")
    .select("servidor_url, usuario, activo, ultimo_sync")
    .limit(1)
    .single();

  const configurada = config?.activo === true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="hidden text-2xl font-bold md:block">GPS / Flota</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          Rastreo en tiempo real de tus vehículos via WhatsGPS
        </p>
      </div>

      {/* Formulario de credenciales */}
      <GpsConfigForm configuracionActual={configurada ? config : null} />

      {/* Mapa — solo si hay credenciales configuradas */}
      {configurada ? (
        <GpsMap />
      ) : (
        <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border)] p-16 text-center space-y-2">
          <p className="font-semibold text-[var(--color-muted-foreground)]">Mapa en tiempo real</p>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto">
            Ingresa tus credenciales de WhatsGPS arriba para ver la posición de tu flota aquí.
          </p>
        </div>
      )}
    </div>
  );
}
