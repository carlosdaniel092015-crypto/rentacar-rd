import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate, NetworkFirst } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-cache",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) =>
              response && response.status === 200 ? response : null,
          },
        ],
      }),
    },
    {
      matcher: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "supabase-images-cache",
      }),
    },
    {
      matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-image-assets",
      }),
    },
    {
      matcher: /\.(?:js|css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: "static-js-assets",
      }),
    },
    {
      matcher: /\/api\/.*/i,
      handler: new NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
      }),
    },
    {
      matcher: /.*/i,
      handler: new NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
      }),
    },
  ],
});

serwist.addEventListeners();

// ── Web Push: notificación nativa (bandeja del teléfono) ──
// `self` se castea a any porque los tipos de service worker (PushEvent, etc.)
// no están en el lib de TS del proyecto; en runtime esto es válido.
/* eslint-disable @typescript-eslint/no-explicit-any */
const swScope = self as any;

swScope.addEventListener("push", (event: any) => {
  let payload: { title?: string; body?: string; url?: string } = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { body: event.data?.text?.() };
  }
  event.waitUntil(
    swScope.registration.showNotification(payload.title ?? "Alma 3D Rent Card", {
      body: payload.body ?? "",
      icon: "/apple-touch-icon.png",
      badge: "/apple-touch-icon.png",
      data: { url: payload.url ?? "/admin/reservas" },
    })
  );
});

swScope.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/admin/reservas";
  event.waitUntil(
    swScope.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList: any[]) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.navigate?.(url);
          return;
        }
      }
      return swScope.clients.openWindow(url);
    })
  );
});
/* eslint-enable @typescript-eslint/no-explicit-any */
