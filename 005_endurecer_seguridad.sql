"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PerfilForm({ obligatorio }: { obligatorio: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cambiar = async () => {
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      await supabase.rpc("mark_password_changed");

      toast.success("Contraseña actualizada.");
      setPassword("");
      setConfirmar("");
      router.push("/admin");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 bg-[var(--color-surface)] space-y-4">
      {obligatorio && (
        <div className="flex items-start gap-2 rounded-[var(--radius)] bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          <KeyRound className="size-4 mt-0.5 shrink-0" />
          <p>Por seguridad, debes establecer una nueva contraseña antes de continuar.</p>
        </div>
      )}

      <div>
        <Label>Nueva contraseña</Label>
        <Input
          className="mt-1"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          autoFocus
        />
      </div>
      <div>
        <Label>Confirmar contraseña</Label>
        <Input
          className="mt-1"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cambiar()}
        />
      </div>
      <Button variant="accent" onClick={cambiar} disabled={enviando || !password || !confirmar}>
        Actualizar contraseña
      </Button>
    </div>
  );
}
