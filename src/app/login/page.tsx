import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

// Si ya hay una sesión activa (Supabase mantiene la cookie viva y la refresca
// sola hasta que el usuario cierra sesión o el refresh token expira), saltamos
// directo al panel sin pedir credenciales de nuevo.
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return <LoginForm />;
}
