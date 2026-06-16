"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    fetch("/api/auth/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, success: !authError }),
    }).catch(() => {});

    if (authError) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-muted)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-2xl">
            <Car className="size-8" />
            RentaCar RD
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-center mb-6">Panel administrativo</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-destructive)] text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
