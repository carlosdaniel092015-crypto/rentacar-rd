"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, Check } from "lucide-react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Botón para activar las notificaciones nativas (Web Push) en este dispositivo.
// Se muestra solo si el navegador lo soporta y aún no está suscrito.
export function PushSubscriber() {
  const [estado, setEstado] = useState<"cargando" | "no-soportado" | "activo" | "inactivo">("cargando");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    const soportado =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      !!VAPID_PUBLIC;
    if (!soportado) {
      setEstado("no-soportado");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? "activo" : "inactivo"))
      .catch(() => setEstado("inactivo"));
  }, []);

  const activar = async () => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        toast.error("Permiso de notificaciones denegado.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!) as unknown as BufferSource,
      });
      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) {
        toast.error("No se pudo activar. Intenta de nuevo.");
        return;
      }
      setEstado("activo");
      toast.success("Notificaciones activadas en este dispositivo.");
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron activar las notificaciones.");
    } finally {
      setOcupado(false);
    }
  };

  if (estado === "cargando" || estado === "no-soportado") return null;

  if (estado === "activo") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-[var(--color-muted-foreground)]">
        <Check className="size-4 text-[var(--color-success)]" />
        Notificaciones activas en este dispositivo
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={activar}
      disabled={ocupado}
      className="flex w-full items-center gap-2 border-b border-[var(--color-border)] px-4 py-3 text-left text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-muted)]/40 disabled:opacity-50"
    >
      <BellRing className="size-4" />
      {ocupado ? "Activando..." : "Activar notificaciones en este dispositivo"}
    </button>
  );
}
