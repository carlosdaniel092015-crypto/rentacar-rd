"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GpsConfigFormProps {
  configuracionActual?: {
    servidor_url: string;
    usuario: string;
    ultimo_sync: string | null;
  } | null;
}

export function GpsConfigForm({ configuracionActual }: GpsConfigFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(!configuracionActual);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    servidor_url: configuracionActual?.servidor_url ?? "https://www.whatsgps.com",
    usuario: configuracionActual?.usuario ?? "",
    clave: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clave.trim() && !configuracionActual) {
      toast.error("La clave es obligatoria");
      return;
    }
    setLoading(true);
    try {
      const body: any = { servidor_url: form.servidor_url, usuario: form.usuario };
      if (form.clave.trim()) body.clave = form.clave;

      const res = await fetch("/api/admin/gps/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) { toast.error(json.error ?? "Error al guardar"); return; }
      toast.success("Credenciales guardadas. Conectando con WhatsGPS...");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium">WhatsGPS conectado</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Cuenta: {configuracionActual?.usuario}
              {configuracionActual?.ultimo_sync && (
                <> · Último sync: {new Date(configuracionActual.ultimo_sync).toLocaleString("es-DO")}</>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Settings className="size-3.5 mr-1.5" /> Cambiar credenciales
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border-2 border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <Settings className="size-5 text-[var(--color-accent)]" />
        <div>
          <h2 className="font-semibold">Credenciales WhatsGPS</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Ingresa los datos de tu cuenta en la plataforma WhatsGPS
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="gps-server">URL del servidor</Label>
          <Input
            id="gps-server"
            value={form.servidor_url}
            onChange={set("servidor_url")}
            placeholder="https://www.whatsgps.com"
          />
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Normalmente es https://www.whatsgps.com — no cambiar salvo indicación
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gps-user">Usuario / Correo de WhatsGPS *</Label>
          <Input
            id="gps-user"
            value={form.usuario}
            onChange={set("usuario")}
            required
            placeholder="usuario@ejemplo.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gps-pass">
            Contraseña de WhatsGPS {configuracionActual && "(dejar vacío para no cambiar)"}
          </Label>
          <div className="relative">
            <Input
              id="gps-pass"
              type={showPass ? "text" : "password"}
              value={form.clave}
              onChange={set("clave")}
              placeholder={configuracionActual ? "••••••••" : "Contraseña"}
              required={!configuracionActual}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="accent" disabled={loading}>
            {loading ? "Guardando..." : "Guardar y conectar"}
          </Button>
          {configuracionActual && (
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
