import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/server/audit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  let body: { email?: string; success?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await logEvent({
    type: "login",
    level: body.success ? "info" : "warn",
    actorEmail: body.email ?? null,
    ip,
    path: "/login",
    method: "POST",
    message: body.success ? "Inicio de sesión exitoso" : "Intento de inicio de sesión fallido",
  });

  return NextResponse.json({ ok: true });
}
