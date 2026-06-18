import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones del servicio de RentaCar RD.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold mb-2">Términos y Condiciones</h1>
      <p className="text-[var(--color-muted-foreground)] text-sm mb-10">Última actualización: junio 2026</p>

      <div className="space-y-8 text-[var(--color-foreground)]">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Aceptación de los términos</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Al utilizar el sitio web y los servicios de <strong>RentaCar RD</strong>, aceptas estos
            Términos y Condiciones en su totalidad. Si no estás de acuerdo, te pedimos que no uses nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Descripción del servicio</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            RentaCar RD ofrece servicios de alquiler de vehículos en República Dominicana.
            Las cotizaciones realizadas en línea constituyen una solicitud de reserva y están sujetas
            a confirmación por parte de nuestro equipo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Requisitos para alquilar</h2>
          <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
            <li>Edad mínima de 21 años (25 para categorías de lujo)</li>
            <li>Licencia de conducir válida (dominicana o internacional)</li>
            <li>Cédula de identidad o pasaporte vigente</li>
            <li>Tarjeta de crédito o débito para depósito de garantía</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Reservas y cancelaciones</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-2">
            Las reservas confirmadas pueden cancelarse sin costo hasta <strong>24 horas antes</strong> de la fecha
            de inicio. Cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a cargos.
            El pago se realiza únicamente al momento de recoger el vehículo; no se realizan cobros anticipados en línea.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Responsabilidades del arrendatario</h2>
          <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
            <li>Devolver el vehículo en las mismas condiciones en que fue entregado</li>
            <li>Respetar las leyes de tránsito de República Dominicana</li>
            <li>No subarrendar el vehículo a terceros</li>
            <li>Reportar cualquier accidente o daño de inmediato</li>
            <li>Repostar con el mismo tipo de combustible con que fue entregado</li>
            <li>No conducir bajo la influencia de alcohol o sustancias</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Daños y seguro</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Todos nuestros vehículos cuentan con seguro básico. El arrendatario es responsable de
            los daños por colisión, vandalismo o pérdida total hasta el monto del deducible establecido
            en el contrato. Se recomienda revisar el estado del vehículo al momento de la entrega.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Precios y pagos</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Los precios publicados en el sitio están en pesos dominicanos (RD$) e incluyen el uso
            básico del vehículo. Pueden aplicarse cargos adicionales por conductor adicional,
            entrega fuera de horario o en ubicación especial, y combustible faltante.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitación de responsabilidad</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            RentaCar RD no será responsable por daños indirectos, pérdida de ingresos o daños
            consecuentes derivados del uso o imposibilidad de uso del vehículo arrendado.
            Nuestra responsabilidad máxima se limita al monto pagado por el servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Ley aplicable</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Estos términos se rigen por las leyes de la República Dominicana.
            Cualquier disputa se resolverá ante los tribunales competentes de Santo Domingo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contacto</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Para preguntas sobre estos términos, escríbenos a{" "}
            <a href="mailto:info@rentacarrd.com" className="text-[var(--color-accent)] underline">info@rentacarrd.com</a>{" "}
            o llámanos al 809-555-1234.
          </p>
        </section>
      </div>
    </div>
  );
}
