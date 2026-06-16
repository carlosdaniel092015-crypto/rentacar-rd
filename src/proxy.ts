import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { logEvent } from "@/lib/server/audit";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Cada sección de /admin requiere su módulo en accesos (o ser principal).
  const PATH_MODULOS: Record<string, string> = {
    "/admin/vehiculos": "vehiculos",
    "/admin/categorias": "categorias",
    "/admin/reservas": "reservas",
    "/admin/logs": "logs",
    "/admin/equipo": "equipo",
  };
  const modulo = Object.entries(PATH_MODULOS).find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (modulo && user) {
    const { data: tieneAcceso } = await supabase.rpc("has_acceso", { modulo });
    if (!tieneAcceso) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return NextResponse.redirect(adminUrl);
    }
  }

  // Si debe cambiar la contraseña (primer login), se le obliga a pasar por /admin/perfil
  // antes de ver cualquier otra sección.
  if (pathname.startsWith("/admin") && pathname !== "/admin/perfil" && user) {
    const { data: debeCambiar } = await supabase.rpc("debe_cambiar_password");
    if (debeCambiar) {
      const perfilUrl = request.nextUrl.clone();
      perfilUrl.pathname = "/admin/perfil";
      return NextResponse.redirect(perfilUrl);
    }
  }

  // Log de visitas en background, no bloquea la respuesta.
  event.waitUntil(
    logEvent({
      type: "visit",
      actorEmail: user?.email ?? null,
      ip,
      path: pathname,
      method: request.method,
    })
  );

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
