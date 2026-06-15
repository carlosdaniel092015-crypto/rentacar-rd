import Link from "next/link";
import Image from "next/image";
import { Users, Fuel, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, TRANSMISIONES } from "@/lib/utils";
import type { Vehiculo, Categoria } from "@/types/database.types";

interface VehicleCardProps {
  vehiculo: Vehiculo;
  categorias: Categoria[];
}

export function VehicleCard({ vehiculo, categorias }: VehicleCardProps) {
  const categoriaLabel = categorias.find((c) => c.slug === vehiculo.categoria)?.nombre ?? vehiculo.categoria;
  const transmisionLabel = TRANSMISIONES.find((t) => t.value === vehiculo.transmision)?.label ?? vehiculo.transmision;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-muted)]">
        {vehiculo.imagen_url ? (
          <Image
            src={vehiculo.imagen_url}
            alt={vehiculo.nombre}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--color-muted-foreground)]">
            Sin imagen
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={vehiculo.disponible ? "success" : "destructive"}>
            {vehiculo.disponible ? "Disponible" : "No disponible"}
          </Badge>
          <Badge variant="secondary">{categoriaLabel}</Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-[var(--color-foreground)] line-clamp-1">{vehiculo.nombre}</h3>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {vehiculo.marca} · {vehiculo.anio}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {vehiculo.pasajeros} asientos
          </span>
          <span className="flex items-center gap-1">
            <Zap className="size-3.5" />
            {transmisionLabel}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="size-3.5" />
            {vehiculo.combustible}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xl font-extrabold text-[var(--color-accent)]">
              {formatCurrency(vehiculo.precio_dia)}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">/día</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/catalogo/${vehiculo.id}`}>Ver detalles</Link>
            </Button>
            {vehiculo.disponible && (
              <Button asChild variant="accent" size="sm">
                <Link href={`/catalogo/${vehiculo.id}#reservar`}>Reservar</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
