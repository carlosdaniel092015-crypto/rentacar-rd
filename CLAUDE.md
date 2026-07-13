"use client";

import { motion } from "framer-motion";
import { Shield, Tag, Clock, MapPin } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Flota certificada",
    description:
      "Todos nuestros vehículos pasan revisiones mecánicas periódicas. Viaja con total tranquilidad.",
  },
  {
    icon: Tag,
    title: "Precios transparentes",
    description:
      "Sin cargos ocultos ni sorpresas. El precio que ves es lo que pagas. Todo incluido.",
  },
  {
    icon: Clock,
    title: "Atención 24/7",
    description:
      "Nuestro equipo está disponible las 24 horas para asistirte en lo que necesites.",
  },
  {
    icon: MapPin,
    title: "Entrega donde estés",
    description:
      "Te llevamos el vehículo al aeropuerto, hotel o donde prefieras sin costo adicional.",
  },
];

export function Features() {
  return (
    <section className="bg-[var(--color-surface)] py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[var(--color-foreground)] sm:text-4xl">
            ¿Por qué elegirnos?
          </h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            Más de 10 años siendo la opción preferida en República Dominicana
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-md transition-all"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                <feature.icon className="size-7 text-[var(--color-accent)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-foreground)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
