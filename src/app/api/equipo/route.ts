import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, MODULOS, type Modulo } from "@/lib/server/equipo";
import { logEvent } from "@/lib/server/audit";
import { sendMail } from "@/lib/server/mailer";

export const dynamic = "force-dynamic";

function generarPassword(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function validarAccesos(input: unknown): input is Modulo[] {
  return Array.isArray(input) && input.every((m) => MODULOS.includes(m));
}

// Listar equipo: solo el principal (CEO/líder).
export async function GET() {
  const member = await getCurrentMember();
  if (!member || member.rol !== "principal") {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "Solo el principal puede ver el equipo." } },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("equipo")
    .select("id, email, nombre, cargo, rol, accesos, activo, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}

// Crear un nuevo miembro del equipo: cuenta de auth + fila en equipo + email con credenciales.
// Solo el principal puede crear usuarios.
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member || member.rol !== "principal") {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "Solo el principal puede crear usuarios." } },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "Cuerpo de solicitud inválido." } },
      { status: 400 }
    );
  }

  const { email, nombre, cargo, accesos, password: passwordInput } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof email !== "string" || !email.includes("@") ||
    typeof nombre !== "string" || nombre.trim().length < 2 ||
    typeof cargo !== "string" || cargo.trim().length < 2 ||
    !validarAccesos(accesos) ||
    (passwordInput !== undefined && (typeof passwordInput !== "string" || passwordInput.length < 8))
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "Datos inválidos. Revisa email, nombre, cargo, accesos y que la contraseña tenga al menos 8 caracteres.",
        },
      },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();
  const password = typeof passwordInput === "string" ? passwordInput : generarPassword();

  const { data: nuevoUsuario, error: authError } = await supabase.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true,
  });

  if (authError || !nuevoUsuario?.user) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: authError?.message ?? "No se pudo crear el usuario." } },
      { status: 409 }
    );
  }

  const { data: equipoRow, error: equipoError } = await supabase
    .from("equipo")
    .insert({
      id: nuevoUsuario.user.id,
      email: email.toLowerCase().trim(),
      nombre: nombre.trim(),
      cargo: cargo.trim(),
      rol: "miembro",
      accesos,
      debe_cambiar_password: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select("id, email, nombre, cargo, rol, accesos, activo")
    .single();

  if (equipoError) {
    await supabase.auth.admin.deleteUser(nuevoUsuario.user.id);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error creando el registro de equipo." } },
      { status: 500 }
    );
  }

  void sendMail({
    to: email,
    subject: "Acceso al panel administrativo — RentaCar RD",
    html: `
      <h2>¡Bienvenido/a al equipo, ${nombre}!</h2>
      <p>Se creó tu cuenta para el panel administrativo con el cargo <strong>${cargo}</strong>.</p>
      <ul>
        <li><strong>Correo:</strong> ${email}</li>
        <li><strong>Contraseña temporal:</strong> ${password}</li>
        <li><strong>Acceso al panel:</strong> ${process.env.NEXT_PUBLIC_SITE_URL}/login</li>
      </ul>
      <p>Por seguridad, cambia tu contraseña después de iniciar sesión.</p>
    `,
  }).catch((err: unknown) => {
    console.error("Error enviando email de bienvenida:", err);
  });

  await logEvent({
    type: "admin_action",
    actorEmail: member.email,
    path: "/api/equipo",
    method: "POST",
    message: "Nuevo miembro de equipo creado",
    details: { email, cargo, accesos },
  });

  return NextResponse.json({ ok: true, data: equipoRow }, { status: 201 });
}
