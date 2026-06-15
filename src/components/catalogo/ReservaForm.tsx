"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { reservaSchema, type ReservaFormData } from "@/lib/validations/reserva.schema";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Vehiculo } from "@/types/database.types";

interface ReservaFormProps {
  vehiculo: Vehiculo;
}

interface ReservaSuccess {
  id: string;
  total: number;
  dias: number;
}

export function ReservaForm({ vehiculo }: ReservaFormProps) {
  const [success, setSuccess] = useState<ReservaSuccess | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      vehiculoId: vehiculo.id,
      fechaInicio: today,
      fechaFin: tomorrow,
    },
  });

  const fechaInicio = watch("fechaInicio");
  const fechaFin = watch("fechaFin");

  const dias = fechaInicio && fechaFin
    ? Math.max(0, differenceInDays(new Date(fechaFin), new Date(fechaInicio)) + 1)
    : 0;
  const total = dias * vehiculo.precio_dia;

  const onSubmit = async (data: ReservaFormData) => {
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg =
          json?.error?.code === "FECHAS_OCUPADAS"
            ? "Esas fechas ya están ocupadas para este vehículo."
            : json?.error?.code === "RATE_LIMIT"
            ? "Demasiadas solicitudes. Intenta más tarde."
            : json?.error?.message ?? "Error al crear la reserva.";
        toast.error(msg);
        return;
      }

      setSuccess(json.data);
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.");
    }
  };

  if (success) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-success)] bg-green-50 p-6 text-center space-y-3">
        <div className="text-4xl">✅</div>
        <h3 className="font-bold text-lg text-[var(--color-foreground)]">
          ¡Reserva recibida!
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Tu solicitud fue registrada. Te contactaremos en breve para confirmar.
        </p>
        <div className="bg-white rounded-lg p-4 text-sm space-y-1">
          <p><strong># Reserva:</strong> {success.id.slice(0, 8).toUpperCase()}</p>
          <p><strong>Días:</strong> {success.dias}</p>
          <p><strong>Total:</strong> {formatCurrency(success.total)}</p>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Recibirás un correo de confirmación. El pago se realiza al recoger el vehículo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="reservar">
      <input type="hidden" {...register("vehiculoId")} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fechaInicio">Fecha inicio</Label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted-foreground)]" />
            <Input
              id="fechaInicio"
              type="date"
              className="pl-9"
              min={today}
              {...register("fechaInicio")}
            />
          </div>
          {errors.fechaInicio && (
            <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.fechaInicio.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="fechaFin">Fecha fin</Label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted-foreground)]" />
            <Input
              id="fechaFin"
              type="date"
              className="pl-9"
              min={fechaInicio ?? today}
              {...register("fechaFin")}
            />
          </div>
          {errors.fechaFin && (
            <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.fechaFin.message}</p>
          )}
        </div>
      </div>

      {dias > 0 && (
        <div className="rounded-lg bg-[var(--color-muted)] p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-muted-foreground)]">{dias} día{dias !== 1 ? "s" : ""} × {formatCurrency(vehiculo.precio_dia)}</span>
            <span className="font-extrabold text-[var(--color-accent)] text-base">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="nombreCliente">Nombre completo</Label>
        <Input
          id="nombreCliente"
          className="mt-1"
          placeholder="ej. Juan Pérez"
          {...register("nombreCliente")}
        />
        {errors.nombreCliente && (
          <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.nombreCliente.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="emailCliente">Correo electrónico</Label>
        <Input
          id="emailCliente"
          type="email"
          className="mt-1"
          placeholder="ej. juan@gmail.com"
          {...register("emailCliente")}
        />
        {errors.emailCliente && (
          <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.emailCliente.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="telefonoCliente">Teléfono</Label>
          <Input
            id="telefonoCliente"
            className="mt-1"
            placeholder="809-555-1234"
            {...register("telefonoCliente")}
          />
          {errors.telefonoCliente && (
            <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.telefonoCliente.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="cedulaCliente">Cédula</Label>
          <Input
            id="cedulaCliente"
            className="mt-1"
            placeholder="000-0000000-0"
            {...register("cedulaCliente")}
          />
          {errors.cedulaCliente && (
            <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.cedulaCliente.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notas">Notas adicionales (opcional)</Label>
        <Textarea
          id="notas"
          className="mt-1"
          placeholder="Ej. necesito entrega en el aeropuerto..."
          rows={3}
          {...register("notas")}
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !vehiculo.disponible}
      >
        {isSubmitting ? "Enviando reserva..." : "Confirmar reserva"}
      </Button>

      {!vehiculo.disponible && (
        <p className="text-center text-sm text-[var(--color-destructive)]">
          Este vehículo no está disponible actualmente.
        </p>
      )}

      <p className="text-xs text-center text-[var(--color-muted-foreground)]">
        Sin pago por adelantado. El pago se realiza al recoger el vehículo.
      </p>
    </form>
  );
}
