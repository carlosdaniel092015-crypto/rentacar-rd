"use client";

import { useEffect } from "react";

/**
 * El modo offline (Serwist) se desactivó para hacer el build compatible con
 * Next 16. Este componente ya no registra un service worker; en su lugar limpia
 * cualquier service worker y caché que hubiera quedado de una instalación
 * anterior, para que los usuarios que ya tenían el PWA instalado dejen de ver la
 * versión cacheada vieja y reciban siempre la última.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.unregister()))
        .catch(() => {});
    }

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => keys.forEach((key) => caches.delete(key)))
        .catch(() => {});
    }
  }, []);

  return null;
}
