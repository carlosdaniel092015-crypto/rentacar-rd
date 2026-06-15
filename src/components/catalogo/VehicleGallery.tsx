"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VehicleGalleryProps {
  nombre: string;
  imagenPrincipal: string | null;
  imagenesUrls: string[];
}

export function VehicleGallery({ nombre, imagenPrincipal, imagenesUrls }: VehicleGalleryProps) {
  // Combinar todas las imágenes sin duplicar la principal
  const todas = imagenPrincipal
    ? [imagenPrincipal, ...imagenesUrls.filter((u) => u !== imagenPrincipal)]
    : imagenesUrls;

  const [activa, setActiva] = useState(0);

  const prev = () => setActiva((i) => (i === 0 ? todas.length - 1 : i - 1));
  const next = () => setActiva((i) => (i === todas.length - 1 ? 0 : i + 1));

  if (todas.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)] group">
        <Image
          key={todas[activa]}
          src={todas[activa]}
          alt={`${nombre} — foto ${activa + 1}`}
          fill
          priority={activa === 0}
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {/* Flechas de navegación — solo si hay más de 1 */}
        {todas.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {todas.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiva(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activa ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"}`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas clicables */}
      {todas.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {todas.map((url, i) => (
            <button
              key={url}
              onClick={() => setActiva(i)}
              className={`relative shrink-0 w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                i === activa
                  ? "border-[var(--color-primary)] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <Image src={url} alt={`${nombre} miniatura ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
