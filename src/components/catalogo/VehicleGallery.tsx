"use client";

import { useState } from "react";
import Image from "next/image";

interface VehicleGalleryProps {
  nombre: string;
  imagenPrincipal: string | null;
  imagenesUrls: string[];
}

export function VehicleGallery({ nombre, imagenPrincipal, imagenesUrls }: VehicleGalleryProps) {
  // Build unique list: principal first, then the rest (no duplicates)
  const todas: string[] = [];
  if (imagenPrincipal) todas.push(imagenPrincipal);
  for (const u of imagenesUrls) {
    if (!todas.includes(u)) todas.push(u);
  }

  const [activa, setActiva] = useState(0);

  if (todas.length === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-muted-foreground)]">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Imagen principal — todas las imágenes apiladas, solo la activa es visible */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-muted)]">
        {todas.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: i === activa ? 1 : 0, zIndex: i === activa ? 1 : 0 }}
          >
            <Image
              src={url}
              alt={`${nombre} — foto ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        ))}
      </div>

      {/* Miniaturas clicables — solo si hay más de una imagen */}
      {todas.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {todas.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setActiva(i)}
              style={{
                outline: "none",
                cursor: "pointer",
                flexShrink: 0,
                width: 80,
                height: 80,
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
                border: i === activa ? "3px solid #F97316" : "3px solid transparent",
                opacity: i === activa ? 1 : 0.6,
                transition: "border-color 0.2s, opacity 0.2s",
                padding: 0,
                background: "transparent",
              }}
            >
              <Image
                src={url}
                alt={`${nombre} miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
