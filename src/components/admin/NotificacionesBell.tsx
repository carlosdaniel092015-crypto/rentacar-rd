"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";

type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string | null;
  url: string | null;
  leida: boolean;
  created_at: string;
};

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function NotificacionesBell({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notificaciones", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setItems(json.data ?? []);
        setNoLeidas(json.noLeidas ?? 0);
      }
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 30000);
    return () => clearInterval(t);
  }, [cargar]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const abrir = async () => {
    setOpen(true);
    if (noLeidas > 0) {
      setNoLeidas(0);
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
      try {
        await fetch("/api/admin/notificaciones", { method: "PATCH" });
      } catch {
        /* silencioso */
      }
    }
  };

  const btnClass =
    variant === "dark"
      ? "relative flex size-[42px] items-center justify-center rounded-[14px] border border-white/15 bg-white/10 text-[#EAF0F8]"
      : "relative flex size-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)]";

  return (
    <div className="relative" ref={panelRef}>
      <button type="button" onClick={open ? () => setOpen(false) : abrir} className={btnClass} aria-label="Notificaciones">
        <Bell className="size-5" />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-[#F2A83B] px-1 text-[10px] font-bold text-[#14263F]">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] z-50 w-[min(88vw,340px)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <span className="text-sm font-bold">Notificaciones</span>
            <button type="button" onClick={() => setOpen(false)} className="text-[var(--color-muted-foreground)]">
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">No hay notificaciones.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (n.url) router.push(n.url);
                  }}
                  className="flex w-full flex-col items-start gap-0.5 border-b border-[var(--color-border)] px-4 py-3 text-left last:border-0 hover:bg-[var(--color-muted)]/40"
                >
                  <span className="text-sm font-semibold">{n.titulo}</span>
                  {n.mensaje && <span className="text-xs text-[var(--color-muted-foreground)]">{n.mensaje}</span>}
                  <span className="mt-0.5 text-[11px] text-[var(--color-muted-foreground)]">{tiempoRelativo(n.created_at)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
