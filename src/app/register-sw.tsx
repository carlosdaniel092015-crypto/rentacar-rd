"use client";
import { useEffect } from "react";
import type { Serwist } from "@serwist/window";

declare global {
  interface Window {
    serwist: Serwist;
  }
}

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.serwist !== undefined) {
      // Cuando un service worker nuevo toma el control (skipWaiting + clientsClaim
      // en sw.ts), recargamos una vez para que la app instalada muestre siempre la
      // última versión. Sin esto, un PWA instalado puede quedarse mostrando una
      // versión vieja cacheada hasta que el usuario lo reinstala.
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      window.serwist.register();
    }
  }, []);
  return null;
}
