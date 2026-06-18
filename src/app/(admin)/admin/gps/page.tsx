import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MapPin, AlertTriangle, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Rastreo GPS | Admin" };
export const dynamic = "force-dynamic";

export default async function GpsPage() {
  const supabase = await createClient();
  const { data: vehiculos } = await supabase
    .from("vehiculos")
    .select("id, nombre, marca, anio, imagen_url, disponible, gps_device_id")
    .order("nombre") as any;

  const vs: any[] = vehiculos ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rastreo GPS</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          Seguimiento y estado de la flota en tiempo real
        </p>
      </div>

      {/* Banner informativo */}
      <div className="rounded-[var(--radius-xl)] border-2 border-amber-200 bg-amber-50 p-5 flex gap-4">
        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-amber-800">Módulo GPS — Configuración requerida</p>
          <p className="text-amber-700">
            Para activar el rastreo en tiempo real necesitas instalar un <strong>dispositivo GPS</strong> en cada vehículo
            y conectarlo a un servicio de rastreo. Opciones recomendadas:
          </p>
          <ul className="list-disc list-inside text-amber-700 space-y-1">
            <li><strong>Traccar</strong> — gratuito y de código abierto, se puede alojar en tu propio servidor</li>
            <li><strong>Wialon / Gurtam</strong> — plataforma profesional para flotas</li>
            <li><strong>Google Maps Platform Fleet Engine</strong> — para integración directa con Google Maps</li>
          </ul>
          <p className="text-amber-700">
            Una vez que tengas el servicio y los IDs de dispositivo, agrégalos a cada vehículo
            en el campo <strong>"ID GPS"</strong> que aparece abajo, y compártenos las credenciales
            de API para activar el mapa en tiempo real.
          </p>
        </div>
      </div>

      {/* Lista de vehículos con estado GPS */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold">Flota — Estado GPS</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {vs.map((v) => (
            <div key={v.id} className="px-6 py-4 flex items-center gap-4">
              <div className={`size-2.5 rounded-full shrink-0 ${v.gps_device_id ? "bg-green-500" : "bg-[var(--color-border)]"}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{v.nombre}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{v.marca} · {v.anio}</p>
              </div>
              <div className="text-right">
                {v.gps_device_id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium">Conectado</span>
                    <span className="text-xs text-[var(--color-muted-foreground)] font-mono">{v.gps_device_id}</span>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--color-muted-foreground)]">Sin GPS asignado</span>
                )}
              </div>
              <a
                href={`/admin/vehiculos/${v.id}/editar`}
                className="text-xs text-[var(--color-accent)] hover:underline shrink-0"
              >
                Editar
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa placeholder */}
      <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/30 p-16 text-center space-y-3">
        <MapPin className="size-10 text-[var(--color-muted-foreground)] mx-auto" />
        <p className="font-semibold text-[var(--color-muted-foreground)]">Mapa en tiempo real</p>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto">
          Aquí aparecerá la ubicación de cada vehículo de la flota una vez que configures el servicio GPS y nos proporciones las credenciales de API.
        </p>
        <a
          href="https://www.traccar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline"
        >
          Conocer Traccar <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
