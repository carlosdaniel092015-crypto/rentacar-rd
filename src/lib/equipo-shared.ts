export const MODULOS = ["vehiculos", "reservas", "categorias", "logs", "automatizacion", "equipo"] as const;
export type Modulo = (typeof MODULOS)[number];

export interface MiembroEquipo {
  id: string;
  email: string;
  nombre: string;
  cargo: string;
  rol: "principal" | "miembro";
  accesos: Modulo[];
  activo: boolean;
}
