import type { Metadata } from "next";
import { EncuestaForm } from "@/components/catalogo/EncuestaForm";

export const metadata: Metadata = { title: "Encuesta de satisfacción | RentaCar RD" };

interface Props { params: Promise<{ id: string }> }

export default async function EncuestaPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">⭐</div>
        <h1 className="text-2xl font-bold mb-2">¿Cómo fue tu experiencia?</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm">
          Tu opinión nos ayuda a seguir mejorando. Solo toma un minuto.
        </p>
      </div>
      <EncuestaForm reservaId={id} />
    </div>
  );
}
