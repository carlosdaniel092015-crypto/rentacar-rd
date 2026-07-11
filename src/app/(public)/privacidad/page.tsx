import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Alma 3D Rent Card.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
      <p className="text-[var(--color-muted-foreground)] text-sm mb-10">Última actualización: junio 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-[var(--color-foreground)]">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Responsable del tratamiento</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            <strong>Alma 3D Rent Card</strong>, con domicilio en Av. Winston Churchill, Santo Domingo, República Dominicana.
            Correo de contacto: <a href="mailto:info@rentacarrd.com" className="text-[var(--color-accent)] underline">info@rentacarrd.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Datos que recopilamos</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-2">
            Cuando realizas una cotización o reserva, recopilamos:
          </p>
          <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Cédula de identidad o número de pasaporte</li>
            <li>Fechas de inicio y fin de la reserva</li>
            <li>Notas adicionales que proporciones voluntariamente</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Finalidad del tratamiento</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-2">Utilizamos tus datos para:</p>
          <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
            <li>Procesar y gestionar tu reserva de vehículo</li>
            <li>Enviarte confirmaciones y notificaciones relacionadas con tu reserva</li>
            <li>Contactarte para coordinar la entrega o devolución del vehículo</li>
            <li>Cumplir con obligaciones legales y fiscales</li>
            <li>Mejorar nuestros servicios mediante encuestas de satisfacción (opcionales)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Base legal</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            El tratamiento de tus datos se basa en la ejecución del contrato de arrendamiento de vehículo
            que solicitas al realizar una cotización, así como en el cumplimiento de obligaciones legales
            aplicables en República Dominicana (Ley 172-13 sobre Protección de Datos Personales).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Conservación de datos</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Conservamos tus datos durante el tiempo necesario para gestionar la reserva y durante
            el período requerido por la legislación aplicable (mínimo 5 años para documentos fiscales).
            Los datos de reservas canceladas se eliminan o anonimisan a los 12 meses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Compartición de datos</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Podemos
            compartir información con proveedores de servicios tecnológicos (almacenamiento en la nube,
            envío de correos electrónicos) que actúan como encargados del tratamiento bajo acuerdos
            de confidencialidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Tus derechos</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-2">
            Conforme a la Ley 172-13, tienes derecho a:
          </p>
          <ul className="list-disc list-inside text-[var(--color-muted-foreground)] space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
            <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos</li>
            <li><strong>Oposición:</strong> oponerte a ciertos tratamientos</li>
          </ul>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed mt-2">
            Para ejercer estos derechos, escríbenos a{" "}
            <a href="mailto:info@rentacarrd.com" className="text-[var(--color-accent)] underline">info@rentacarrd.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Seguridad</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos
            contra accesos no autorizados, pérdida o divulgación, incluyendo cifrado en tránsito (HTTPS)
            y en reposo, control de acceso basado en roles y registros de auditoría.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Cambios en esta política</h2>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed">
            Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos
            por correo electrónico o mediante un aviso prominente en nuestro sitio.
          </p>
        </section>
      </div>
    </div>
  );
}
