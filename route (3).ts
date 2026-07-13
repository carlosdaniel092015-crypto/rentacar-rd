"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function EncuestaForm({ reservaId }: { reservaId: string }) {
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const etiquetas = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

  const enviar = async () => {
    if (estrellas === 0) { toast.error("Por favor selecciona una calificación."); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservaId, estrellas, comentario }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
    } catch {
      toast.error("Error al enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-success)] bg-green-50 p-8 text-center space-y-3">
        <div className="text-4xl">🎉</div>
        <h2 className="font-bold text-lg">¡Gracias por tu opinión!</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Tu calificación de <strong>{estrellas} estrella{estrellas !== 1 ? "s" : ""}</strong> ha sido registrada.
          Nos ayuda a mejorar constantemente.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 space-y-6">
      {/* Estrellas */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Califica tu experiencia</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setEstrellas(n)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`size-10 ${
                  n <= (hover || estrellas)
                    ? "fill-amber-400 text-amber-400"
                    : "text-[var(--color-border)]"
                }`}
              />
            </button>
          ))}
        </div>
        {(hover || estrellas) > 0 && (
          <p className="text-sm font-semibold text-amber-600">
            {etiquetas[hover || estrellas]}
          </p>
        )}
      </div>

      {/* Comentario */}
      <div>
        <label className="text-sm font-medium block mb-2">
          Comentarios (opcional)
        </label>
        <Textarea
          placeholder="¿Qué mejorarías? ¿Qué te gustó más?"
          rows={4}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>

      <Button
        variant="accent"
        size="lg"
        className="w-full"
        onClick={enviar}
        disabled={enviando || estrellas === 0}
      >
        {enviando ? "Enviando..." : "Enviar calificación"}
      </Button>
    </div>
  );
}
