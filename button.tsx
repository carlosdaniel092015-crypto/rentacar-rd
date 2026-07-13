"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

interface VehiculoGPS {
  id: string;
  nombre: string;
  placa: string;
  lat: number;
  lng: number;
  velocidad: number;
  curso: number;
  motor: boolean;
  ultimaActualizacion: string;
  direccion: string;
}

const REFRESH_INTERVAL = 30_000; // 30 segundos

export function GpsMap() {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [vehiculos, setVehiculos] = useState<VehiculoGPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selected, setSelected] = useState<VehiculoGPS | null>(null);

  const fetchVehiculos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gps/vehicles");
      const json = await res.json();
      if (!json.ok) { setError(json.error); return; }
      setError(null);
      setVehiculos(json.data);
      setLastSync(new Date());
      return json.data as VehiculoGPS[];
    } catch {
      setError("Error de red al conectar con WhatsGPS");
    }
  }, []);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix icono por defecto de Leaflet en Next.js
      (L.Icon.Default as any).mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current!, {
        center: [18.4861, -69.9312], // Santo Domingo, RD
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Primera carga
      fetchVehiculos().then((vs) => {
        if (vs) updateMarkers(L, map, vs);
        setLoading(false);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      const vs = await fetchVehiculos();
      if (vs && mapRef.current) {
        import("leaflet").then((L) => updateMarkers(L, mapRef.current, vs));
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchVehiculos]);

  function updateMarkers(L: any, map: any, vs: VehiculoGPS[]) {
    const seen = new Set<string>();

    for (const v of vs) {
      if (!v.lat || !v.lng) continue;
      seen.add(v.id);

      const color = v.motor ? "#22c55e" : "#94a3b8";
      const icon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:${color};border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:700;color:white;
          transform:rotate(${v.curso}deg);
        ">▲</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupHtml = `
        <div style="min-width:180px;font-family:sans-serif">
          <p style="font-weight:700;margin:0 0 4px">${v.nombre}</p>
          ${v.placa ? `<p style="margin:0 0 2px;font-size:12px;color:#666">Placa: ${v.placa}</p>` : ""}
          <p style="margin:0 0 2px;font-size:12px">Motor: <strong style="color:${v.motor ? "#22c55e" : "#94a3b8"}">${v.motor ? "Encendido" : "Apagado"}</strong></p>
          <p style="margin:0 0 2px;font-size:12px">Velocidad: <strong>${v.velocidad} km/h</strong></p>
          ${v.direccion ? `<p style="margin:0;font-size:11px;color:#666">${v.direccion}</p>` : ""}
        </div>
      `;

      if (markersRef.current.has(v.id)) {
        const m = markersRef.current.get(v.id);
        m.setLatLng([v.lat, v.lng]);
        m.setIcon(icon);
        m.getPopup()?.setContent(popupHtml);
      } else {
        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml);
        markersRef.current.set(v.id, marker);
      }
    }

    // Remover marcadores de vehículos que ya no están
    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Si solo hay un vehículo y tiene coordenadas, centrar el mapa
    if (vs.length === 1 && vs[0].lat && vs[0].lng) {
      map.setView([vs[0].lat, vs[0].lng], 15);
    } else if (vs.length > 1) {
      const validVs = vs.filter(v => v.lat && v.lng);
      if (validVs.length > 0) {
        const bounds = L.latLngBounds(validVs.map(v => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }

  const handleSelect = (v: VehiculoGPS) => {
    setSelected(v);
    if (mapRef.current && v.lat && v.lng) {
      mapRef.current.setView([v.lat, v.lng], 16);
      markersRef.current.get(v.id)?.openPopup();
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    const vs = await fetchVehiculos();
    if (vs && mapRef.current) {
      import("leaflet").then((L) => updateMarkers(L, mapRef.current, vs));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de estado */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {error ? (
            <WifiOff className="size-4 text-red-500" />
          ) : (
            <Wifi className="size-4 text-green-500" />
          )}
          <span className="text-sm font-medium">
            {error ? (
              <span className="text-red-600">{error}</span>
            ) : (
              <span className="text-[var(--color-muted-foreground)]">
                {vehiculos.length} vehículo{vehiculos.length !== 1 ? "s" : ""} en flota
                {lastSync && ` · Actualizado ${lastSync.toLocaleTimeString("es-DO")}`}
              </span>
            )}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[var(--radius)] border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Lista de vehículos */}
        <div className="lg:col-span-1 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-sm font-semibold">Flota</p>
          </div>
          <div className="divide-y divide-[var(--color-border)] max-h-[420px] overflow-y-auto">
            {vehiculos.length === 0 && !loading && (
              <p className="px-4 py-6 text-sm text-center text-[var(--color-muted-foreground)]">
                Sin vehículos detectados
              </p>
            )}
            {vehiculos.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelect(v)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-[var(--color-muted)]/40 ${
                  selected?.id === v.id ? "bg-[var(--color-accent)]/10" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full shrink-0 ${v.motor ? "bg-green-500" : "bg-slate-300"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{v.nombre}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {v.motor ? `${v.velocidad} km/h` : "Motor apagado"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-[var(--color-surface)]/80 z-10 flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                <RefreshCw className="size-4 animate-spin" />
                Conectando con WhatsGPS...
              </div>
            </div>
          )}
          <div ref={mapContainerRef} style={{ height: "480px", width: "100%" }} />
        </div>
      </div>

      {/* Detalle vehículo seleccionado */}
      {selected && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold">{selected.nombre}</p>
              {selected.placa && <p className="text-sm text-[var(--color-muted-foreground)]">Placa: {selected.placa}</p>}
              {selected.direccion && <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{selected.direccion}</p>}
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">{selected.velocidad}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">km/h</p>
              </div>
              <div>
                <p className={`text-lg font-bold ${selected.motor ? "text-green-500" : "text-slate-400"}`}>
                  {selected.motor ? "ON" : "OFF"}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)]">Motor</p>
              </div>
              <div>
                <p className="text-sm font-medium">{selected.lat.toFixed(5)}</p>
                <p className="text-sm font-medium">{selected.lng.toFixed(5)}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">Coordenadas</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
