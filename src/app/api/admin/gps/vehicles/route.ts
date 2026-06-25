import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

interface WhatsGPSDevice {
  imei?: string;
  deviceId?: string;
  name?: string;
  plateNumber?: string;
  lat?: number;
  lng?: number;
  speed?: number;
  course?: number;
  acc?: number | string;   // motor: 0/1 o "on"/"off"
  gpsTime?: string;
  address?: string;
  status?: string | number;
}

async function getWhatsGPSToken(servidorUrl: string, usuario: string, clave: string): Promise<string> {
  // Intento 1: endpoint estándar SEEWORLD / WhatsGPS
  const res = await fetch(`${servidorUrl}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: usuario, password: clave }),
    signal: AbortSignal.timeout(8000),
  });
  if (res.ok) {
    const json = await res.json();
    const token = json?.data?.token ?? json?.token ?? json?.data?.userToken;
    if (token) return token;
  }

  // Intento 2: endpoint alternativo (algunas versiones usan /api/login)
  const res2 = await fetch(`${servidorUrl}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: usuario, password: clave }),
    signal: AbortSignal.timeout(8000),
  });
  if (res2.ok) {
    const json2 = await res2.json();
    const token2 = json2?.data?.token ?? json2?.token;
    if (token2) return token2;
  }

  throw new Error("No se pudo autenticar con WhatsGPS. Verifica las credenciales.");
}

async function getDevices(servidorUrl: string, token: string): Promise<WhatsGPSDevice[]> {
  // Intento 1: /api/device/list
  const res = await fetch(`${servidorUrl}/api/device/list`, {
    headers: { Authorization: token, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (res.ok) {
    const json = await res.json();
    const devices = json?.data ?? json?.result ?? json?.devices ?? [];
    if (Array.isArray(devices) && devices.length > 0) return devices;
  }

  // Intento 2: /api/devices
  const res2 = await fetch(`${servidorUrl}/api/devices`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (res2.ok) {
    const json2 = await res2.json();
    const devices2 = json2?.data ?? json2 ?? [];
    if (Array.isArray(devices2)) return devices2;
  }

  return [];
}

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient() as any;
  const { data: config } = await supabase
    .from("gps_configuracion")
    .select("servidor_url, usuario, clave, activo")
    .limit(1)
    .single();

  if (!config || !config.activo) {
    return NextResponse.json({ ok: false, error: "GPS no configurado" }, { status: 404 });
  }

  try {
    const token = await getWhatsGPSToken(config.servidor_url, config.usuario, config.clave);
    const devices = await getDevices(config.servidor_url, token);

    // Actualizar último sync
    await supabase
      .from("gps_configuracion")
      .update({ ultimo_sync: new Date().toISOString() })
      .eq("usuario", config.usuario);

    const vehiculos = devices.map((d: WhatsGPSDevice) => ({
      id: d.imei ?? d.deviceId ?? String(Math.random()),
      nombre: d.name ?? d.plateNumber ?? "Sin nombre",
      placa: d.plateNumber ?? "",
      lat: d.lat ?? 0,
      lng: d.lng ?? 0,
      velocidad: d.speed ?? 0,
      curso: d.course ?? 0,
      motor: d.acc === 1 || d.acc === "on" || d.status === 1,
      ultimaActualizacion: d.gpsTime ?? new Date().toISOString(),
      direccion: d.address ?? "",
    }));

    return NextResponse.json({ ok: true, data: vehiculos });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? "Error conectando con WhatsGPS" }, { status: 502 });
  }
}
