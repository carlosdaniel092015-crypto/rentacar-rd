"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, Car } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Elige tu vehículo",
    description:
      "Explora nuestra flota y filtra por categoría, precio o capacidad. Encuentra el vehículo perfecto.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Reserva en minutos",
    description:
      "Completa el formulario de reserva en menos de 2 minutos. Sin tarjeta de crédito por adelantado.",
  },
  {
    number: "03",
    icon: Car,
    title: "¡Disfruta tu viaje!",
    description:
      "Recoge el vehículo en nuestra oficina o pedimos entregarlo en tu ubicación. Paga al recibirlo.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-[var(--color-muted)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">Reservar es muy fácil</h2>
          <p className="mt-3 text-[var(--color-muted-foreground)]">3 pasos y listo</p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Línea conectora */}
          <div className="absolute top-12 left-1/4 right-1/4 h-px bg-[var(--color-border)] hidden md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6 flex size-24 flex-col items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg">
                <step.icon className="size-8 mb-1" />
                <span className="text-xs font-bold opacity-70">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
