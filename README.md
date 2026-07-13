"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { contactoSchema, type ContactoFormData } from "@/lib/validations/contacto.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAPS_EMBED = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ?? "";

const info = [
  { icon: Phone, label: "Teléfono", value: "809-555-1234" },
  { icon: Mail, label: "Correo", value: "info@rentacard.com" },
  { icon: MapPin, label: "Dirección", value: "Av. Winston Churchill #123, Santo Domingo, RD" },
  { icon: Clock, label: "Horario", value: "Lunes–Domingo: 7:00am – 9:00pm" },
];

export default function ContactoPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactoFormData>({
    resolver: zodResolver(contactoSchema),
  });

  const onSubmit = async (data: ContactoFormData) => {
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Mensaje enviado. Te responderemos a la brevedad.");
        reset();
      } else {
        toast.error("Error al enviar. Intenta nuevamente.");
      }
    } catch {
      toast.error("Error de conexión.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Contáctanos</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          Estamos para ayudarte en lo que necesites
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Formulario */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <h2 className="font-semibold text-lg mb-6">Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Honeypot */}
            <input type="text" className="hidden" tabIndex={-1} {...register("_honeypot")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" className="mt-1" placeholder="Tu nombre" {...register("nombre")} />
                {errors.nombre && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" className="mt-1" placeholder="tu@email.com" {...register("email")} />
                {errors.email && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input id="telefono" className="mt-1" placeholder="809-000-0000" {...register("telefono")} />
            </div>

            <div>
              <Label htmlFor="asunto">Asunto</Label>
              <Input id="asunto" className="mt-1" placeholder="¿En qué podemos ayudarte?" {...register("asunto")} />
              {errors.asunto && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.asunto.message}</p>}
            </div>

            <div>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea id="mensaje" className="mt-1" rows={5} placeholder="Escribe tu mensaje aquí..." {...register("mensaje")} />
              {errors.mensaje && <p className="text-xs text-[var(--color-destructive)] mt-1">{errors.mensaje.message}</p>}
            </div>

            <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </Button>
          </form>
        </div>

        {/* Info + mapa */}
        <div className="space-y-6">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
            <h2 className="font-semibold text-lg mb-6">Información de contacto</h2>
            <ul className="space-y-4">
              {info.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-accent)]/10 shrink-0">
                    <item.icon className="size-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {MAPS_EMBED && (
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]">
              <iframe
                src={MAPS_EMBED}
                width="100%"
                height="300"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Alma 3D Rent Card"
                className="block"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
