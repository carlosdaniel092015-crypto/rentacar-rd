"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F5F1EB]">
      {/* Hero navy con logo — se siente como app nativa */}
      <div
        className="rounded-b-[32px] bg-[linear-gradient(160deg,#1C3555_0%,#14263F_100%)] px-6 pb-12 text-white"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)" }}
      >
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-[#F2A83B] text-2xl font-black text-[#14263F] shadow-lg">
            A3
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Alma 3D Rent Card</h1>
            <p className="mt-1 text-sm text-white/55">Panel administrativo</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 px-6">
        <div className="mx-auto -mt-8 w-full max-w-sm rounded-[24px] border border-[#ECE6DD] bg-white p-6 shadow-[0_12px_40px_-12px_rgba(20,38,63,0.25)]">
          <h2 className="mb-5 text-lg font-bold text-[#14263F]">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                className="mt-1.5 h-12 rounded-xl text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                className="mt-1.5 h-12 rounded-xl text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-[var(--color-destructive)]/10 px-3 py-2 text-center text-sm text-[var(--color-destructive)]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="accent"
              className="mt-1 h-12 w-full rounded-xl text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-sm justify-center pb-8">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[#7B8794] transition-colors hover:text-[#14263F]"
          >
            <ExternalLink className="size-4" />
            Ir al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}
