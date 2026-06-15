import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "RentaCar RD — Alquiler de Vehículos en República Dominicana",
};

export const revalidate = 3600;

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18091234567";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />

      {/* CTA final */}
      <section className="bg-[var(--color-primary)] py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-white/80 mb-8">
            Reserva en minutos y paga al recoger el vehículo. Sin complicaciones.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="accent" size="xl">
              <Link href="/catalogo">Ver catálogo completo</Link>
            </Button>
            <Button
              asChild
              size="xl"
              className="border-white text-white bg-transparent border hover:bg-white/10"
            >
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola, me interesa rentar un vehículo")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="size-5" />
                Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
