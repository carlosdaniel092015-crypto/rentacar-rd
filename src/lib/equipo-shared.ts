export const MODULOS = ["vehiculos", "reservas", "contactos", "categorias", "logs", "automatizacion", "equipo", "analitica", "gps"] as const;
export type Modulo = (typeof MODULOS)[number];

export interface MiembroEquipo {
  id: string;
  email: string;
  nombre: string;
  cargo: string;
  rol: "principal" | "miembro";
  accesos: Modulo[];
  activo: boolean;
  debe_cambiar_password: boolean;
}
