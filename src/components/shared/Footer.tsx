import Link from "next/link";
import { Car, Phone, Mail, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Car className="size-6" />
              RentaCar RD
            </Link>
            <p className="text-sm opacity-80">
              Tu empresa de confianza para alquiler de vehículos en República Dominicana.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/" className="hover:opacity-100 transition-opacity">Inicio</Link></li>
              <li><Link href="/catalogo" className="hover:opacity-100 transition-opacity">Catálogo</Link></li>
              <li><Link href="/contacto" className="hover:opacity-100 transition-opacity">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm opacity-80">
              {["Económico", "SUV", "Pickup", "Lujo", "Van"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/catalogo?categoria=${cat.toLowerCase()}`}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>809-555-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                <span>info@rentacard.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span>Av. Winston Churchill, Santo Domingo</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                <span>Lun–Dom: 7am – 9pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 text-center text-sm opacity-60">
          <p>© {new Date().getFullYear()} RentaCar RD. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
