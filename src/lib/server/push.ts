import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;

function configurar(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:reservas.rentacard@gmail.com",
    publicKey,
    privateKey
  );
  configured = true;
  return true;
}

// Envía una notificación push nativa a todos los dispositivos suscritos del panel.
// Best-effort: limpia suscripciones caducadas (410/404) y nunca lanza.
export async function enviarPush(payload: { title: string; body: string; url?: string }) {
  if (!configurar()) {
    console.warn("[push] VAPID no configurado: se omite la notificación nativa.");
    return;
  }

  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .overrideTypes<{ endpoint: string; p256dh: string; auth: string }[]>();

  if (!subs || subs.length === 0) return;

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/admin/reservas",
  });

  await Promise.allSettled(
    subs.map((s) =>
      webpush
        .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, data)
        .catch(async (err: unknown) => {
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          } else {
            console.error("[push] error enviando:", err);
          }
        })
    )
  );
}
