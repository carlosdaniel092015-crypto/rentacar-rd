"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonios = [
  {
    nombre: "María García",
    ciudad: "Santo Domingo",
    texto:
      "Excelente servicio. El vehículo estaba en perfectas condiciones y el proceso de reserva fue rapidísimo. Definitivamente los vuelvo a usar.",
    estrellas: 5,
  },
  {
    nombre: "Carlos Méndez",
    ciudad: "Santiago",
    texto:
      "Llevaba años buscando una empresa de rent a car confiable en RD. Precios justos, sin sorpresas al momento de devolver el carro. 100% recomendados.",
    estrellas: 5,
  },
  {
    nombre: "Ana Rodríguez",
    ciudad: "Punta Cana",
    texto:
      "Me entregaron el SUV directo en el aeropuerto. El equipo es muy amable y profesional. El mejor servicio que he tenido aquí en RD.",
    estrellas: 5,
  },
];

export function Testimonials() {
  return (
    <section className="bg-[var(--color-surface)] py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">Lo que dicen nuestros clientes</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonios.map((t, i) => (
            <motion.div
              key={t.nombre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-muted)] p-6"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.estrellas }).map((_, j) => (
                  <Star key={j} className="size-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                ))}
              </div>
              <p className="text-sm text-[var(--color-foreground)] mb-4 leading-relaxed">
                "{t.texto}"
              </p>
              <div>
                <p className="font-semibold text-sm">{t.nombre}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{t.ciudad}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
