import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function SinAccesoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-muted)] px-4">
      <div className="max-w-sm text-center space-y-3">
        <ShieldOff className="size-10 mx-auto text-[var(--color-muted-foreground)]" />
        <h1 className="text-xl font-semibold">Sin acceso al panel</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm">
          Tu cuenta no tiene un usuario asignado en el equipo administrativo. Contacta al
          CEO/líder de la empresa para que te dé acceso.
        </p>
        <Link href="/login" className="text-[var(--color-primary)] text-sm font-medium underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
