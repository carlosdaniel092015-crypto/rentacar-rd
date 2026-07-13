import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/server/audit";
import { checkRateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

// Valida las credenciales en el servidor y registra el intento real en el
// audit log — el cliente nunca puede reportar un resultado falso, porque el
// resultado lo decide este endpoint, no el body de la petición.
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!(await checkRateLimit("login", ip, 10, 10 * 60))) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMIT", message: "Demasiados intentos. Intenta más tarde." } },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION", message: "Solicitud inválida." } }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION", message: "Email y contraseña son obligatorios." } }, { status: 422 });
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

  await logEvent({
    type: "login",
    level: authError ? "warn" : "info",
    actorEmail: email,
    ip,
    path: "/login",
    method: "POST",
    message: authError ? "Intento de inicio de sesión fallido" : "Inicio de sesión exitoso",
  });

  if (authError) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Credenciales incorrectas." } },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
