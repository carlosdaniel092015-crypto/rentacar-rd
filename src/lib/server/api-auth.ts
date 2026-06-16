import "server-only";
import { NextRequest, NextResponse } from "next/server";

// Protege endpoints pensados para automatizaciones externas (n8n, etc.),
// distintos de los que consume el sitio público (esos no requieren clave).
export function requireApiKey(req: NextRequest): NextResponse | null {
  const expected = process.env.AUTOMATION_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "API de automatización no configurada." } },
      { status: 500 }
    );
  }

  const provided = req.headers.get("x-api-key");
  if (provided !== expected) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "API key inválida o ausente." } },
      { status: 401 }
    );
  }

  return null;
}
