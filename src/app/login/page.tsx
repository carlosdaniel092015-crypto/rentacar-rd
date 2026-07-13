"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const inputClass =
    "mt-1.5 h-12 rounded-xl border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 text-base md:mt-1 md:h-10 md:rounded-[var(--radius-md)] md:bg-transparent md:text-sm";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--color-surface)] md:items-center md:justify-center md:bg-[var(--color-muted)] md:px-4">
      <div className="bg-[linear-gradient(160deg,#1C3555_0%,#14263F_100%)] px-6 pb-16 pt-[calc(env(safe-area-inset-top)+2.25rem)] text-white md:hidden">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="mb-9 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/65 transition-colors active:text-white">
          <ArrowLeft className="size-4" />
          Ir al sitio principal
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F2A83B] text-lg font-black tracking-tight text-[#14263F] shadow-lg shadow-black/20">A3</div>
          <div className="leading-tight">
            <p className="text-[19px] font-extrabold">Alma 3D Rent Card</p>
            <p className="text-[13px] text-white/60">Panel administrativo</p>
          </div>
        </div>
      </div>

      <div className="-mt-8 flex-1 rounded-t-[28px] bg-[var(--color-surface)] px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 shadow-[0_-10px_30px_-12px_rgba(20,38,63,0.18)] md:mt-0 md:w-full md:max-w-sm md:flex-none md:rounded-[var(--radius-xl)] md:border md:border-[var(--color-border)] md:p-8 md:shadow-sm">
        <div className="mb-8 hidden flex-col items-center gap-3 md:flex">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 self-start text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-primary)]">
            <ArrowLeft className="size-4" />
            Ir al sitio principal
          </Link>
          <div className="flex items-center gap-2 text-2xl font-bold text-[var(--color-primary)]">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-base font-black tracking-tight text-white shadow">A3</div>
            Alma 3D Rent Card
          </div>
        </div>

        <div className="mb-6 md:text-center">
          <h1 className="text-[22px] font-extrabold text-[var(--color-foreground)] md:text-xl md:font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)] md:hidden">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" inputMode="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="tucorreo@ejemplo.com" />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} className={`${inputClass} pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 mt-1.5 flex w-12 items-center justify-center text-[var(--color-muted-foreground)] transition-colors active:text-[var(--color-foreground)] md:mt-1" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-[var(--color-destructive)]/10 px-3 py-2 text-center text-sm font-medium text-[var(--color-destructive)]">{error}</p>
          )}

          <Button type="submit" size="lg" disabled={loading} className="mt-2 h-13 w-full rounded-xl text-base font-semibold md:h-11 md:rounded-[var(--radius-md)]">
            {loading ? (<><Loader2 className="size-5 animate-spin" />Iniciando sesión...</>) : ("Iniciar sesión")}
          </Button>
        </form>
      </div>
    </div>
  );
}
