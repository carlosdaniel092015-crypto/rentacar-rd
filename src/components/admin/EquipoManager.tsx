"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MODULOS, type Modulo, type MiembroEquipo } from "@/lib/equipo-shared";

const MODULO_LABELS: Record<Modulo, string> = {
  vehiculos: "Vehículos",
  reservas: "Reservas",
  categorias: "Categorías",
  logs: "Logs",
  automatizacion: "Automatización",
  equipo: "Equipo",
};

interface EquipoManagerProps {
  miembros: (MiembroEquipo & { created_at: string })[];
  principalId: string;
}

export function EquipoManager({ miembros, principalId }: EquipoManagerProps) {
  const router = useRouter();
  const [creando, setCreando] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="accent" onClick={() => setCreando((v) => !v)}>
          <Plus className="size-4 mr-2" />
          Nuevo usuario
        </Button>
      </div>

      {creando && (
        <CrearMiembroForm
          onDone={() => {
            setCreando(false);
            router.refresh();
          }}
        />
      )}

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Cargo</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Accesos</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {miembros.map((m) => (
                <FilaMiembro key={m.id} miembro={m} esUnoMismo={m.id === principalId} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CrearMiembroForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [accesos, setAccesos] = useState<Modulo[]>([]);
  const [enviando, setEnviando] = useState(false);

  const toggleAcceso = (modulo: Modulo) =>
    setAccesos((prev) => (prev.includes(modulo) ? prev.filter((m) => m !== modulo) : [...prev, modulo]));

  const crear = async () => {
    if (!email.trim() || !nombre.trim() || !cargo.trim()) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), nombre: nombre.trim(), cargo: cargo.trim(), accesos }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error?.message ?? "Error creando usuario.");
        return;
      }
      toast.success("Usuario creado. Se le envió un correo con sus credenciales.");
      onDone();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 bg-[var(--color-surface)] space-y-3 max-w-lg">
      <h2 className="font-semibold text-sm">Nuevo usuario del equipo</h2>
      <div>
        <Label>Nombre</Label>
        <Input className="mt-1" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="ej. María Pérez" />
      </div>
      <div>
        <Label>Correo electrónico</Label>
        <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@rentacard.com" />
      </div>
      <div>
        <Label>Cargo</Label>
        <Input className="mt-1" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="ej. Agente de Reservas" />
      </div>
      <div>
        <Label>Accesos</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {MODULOS.map((modulo) => (
            <label key={modulo} className="flex items-center gap-2 text-sm">
              <Checkbox checked={accesos.includes(modulo)} onCheckedChange={() => toggleAcceso(modulo)} />
              {MODULO_LABELS[modulo]}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="accent" onClick={crear} disabled={enviando || !email.trim() || !nombre.trim() || !cargo.trim()}>
          <Check className="size-4 mr-1" /> Crear usuario
        </Button>
        <Button size="sm" variant="outline" onClick={onDone} disabled={enviando}>
          <X className="size-4 mr-1" /> Cancelar
        </Button>
      </div>
    </div>
  );
}

function FilaMiembro({ miembro, esUnoMismo }: { miembro: MiembroEquipo & { created_at: string }; esUnoMismo: boolean }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [cargo, setCargo] = useState(miembro.cargo);
  const [accesos, setAccesos] = useState<Modulo[]>(miembro.accesos);
  const [guardando, setGuardando] = useState(false);

  const toggleAcceso = (modulo: Modulo) =>
    setAccesos((prev) => (prev.includes(modulo) ? prev.filter((m) => m !== modulo) : [...prev, modulo]));

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`/api/equipo/${miembro.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo: cargo.trim(), accesos }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error?.message ?? "Error actualizando.");
        return;
      }
      toast.success("Actualizado.");
      setEditando(false);
      router.refresh();
    } finally {
      setGuardando(false);
    }
  };

  const cambiarActivo = async (activo: boolean) => {
    const res = await fetch(`/api/equipo/${miembro.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    });
    const json = await res.json();
    if (!json.ok) {
      toast.error(json.error?.message ?? "Error actualizando.");
      return;
    }
    toast.success(activo ? "Usuario reactivado." : "Usuario desactivado.");
    router.refresh();
  };

  if (editando) {
    return (
      <tr className="bg-[var(--color-muted)]/30">
        <td className="px-4 py-3 font-medium">{miembro.nombre}</td>
        <td className="px-4 py-3">
          <Input className="h-8 text-sm" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </td>
        <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{miembro.rol}</td>
        <td className="px-4 py-3">
          <div className="grid grid-cols-2 gap-1">
            {MODULOS.map((modulo) => (
              <label key={modulo} className="flex items-center gap-1.5 text-xs">
                <Checkbox checked={accesos.includes(modulo)} onCheckedChange={() => toggleAcceso(modulo)} />
                {MODULO_LABELS[modulo]}
              </label>
            ))}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={miembro.activo ? "success" : "destructive"}>{miembro.activo ? "Activo" : "Inactivo"}</Badge>
        </td>
        <td className="px-4 py-3 text-right space-x-1">
          <Button size="sm" variant="accent" onClick={guardar} disabled={guardando}>
            <Check className="size-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditando(false)} disabled={guardando}>
            <X className="size-4" />
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-[var(--color-muted)]/30">
      <td className="px-4 py-3">
        <p className="font-medium">{miembro.nombre}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{miembro.email}</p>
      </td>
      <td className="px-4 py-3">{miembro.cargo}</td>
      <td className="px-4 py-3">
        <Badge variant={miembro.rol === "principal" ? "default" : "secondary"}>
          {miembro.rol === "principal" ? "Principal (CEO/líder)" : "Miembro"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {miembro.rol === "principal" ? (
          <span className="text-xs text-[var(--color-muted-foreground)]">Acceso total</span>
        ) : miembro.accesos.length === 0 ? (
          <span className="text-xs text-[var(--color-muted-foreground)]">Sin accesos</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {miembro.accesos.map((a) => (
              <Badge key={a} variant="secondary" className="text-xs">
                {MODULO_LABELS[a]}
              </Badge>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={miembro.activo ? "success" : "destructive"}>{miembro.activo ? "Activo" : "Inactivo"}</Badge>
      </td>
      <td className="px-4 py-3 text-right space-x-1">
        {miembro.rol !== "principal" && (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
              Editar
            </Button>
            <Button
              size="sm"
              variant={miembro.activo ? "destructive" : "outline"}
              disabled={esUnoMismo}
              onClick={() => cambiarActivo(!miembro.activo)}
            >
              {miembro.activo ? "Desactivar" : "Reactivar"}
            </Button>
          </>
        )}
      </td>
    </tr>
  );
}
