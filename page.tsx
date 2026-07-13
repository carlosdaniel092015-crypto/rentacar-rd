"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18091234567";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 to-[var(--color-primary)]/60" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-semibold text-[var(--color-accent-foreground)]"
          >
            ✓ Disponible 24 horas · 7 días a la semana
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            Tu próximo viaje
            <br />
            <span className="text-[var(--color-accent)]">empieza aquí</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mx-auto max-w-2xl text-lg text-white/80 sm:text-xl"
          >
            La mejor flota de vehículos en República Dominicana. Precios transparentes,
            sin cargos ocultos. Recoge y entrega donde tú elijas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button asChild variant="accent" size="xl">
              <Link href="/catalogo" className="flex items-center gap-2">
                Ver vehículos disponibles
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="border-white text-white hover:bg-white/10"
            >
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me interesa rentar un vehículo")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="size-5" />
                WhatsApp directo
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-8 pt-4 text-white/70"
          >
            {[
              { label: "Vehículos", value: "50+" },
              { label: "Clientes satisfechos", value: "2,000+" },
              { label: "Años de experiencia", value: "10+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
