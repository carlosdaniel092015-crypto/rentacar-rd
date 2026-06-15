import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CATEGORIAS = [
  { value: "economico", label: "Económico" },
  { value: "sedan", label: "Sedán" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
  { value: "van", label: "Van" },
  { value: "lujo", label: "Lujo" },
  { value: "deportivo", label: "Deportivo" },
] as const;

export const TRANSMISIONES = [
  { value: "manual", label: "Manual" },
  { value: "automatica", label: "Automática" },
] as const;

export const COMBUSTIBLES = [
  { value: "gasolina", label: "Gasolina" },
  { value: "diesel", label: "Diésel" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
] as const;

export const ESTADOS_RESERVA = [
  { value: "pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmada", label: "Confirmada", color: "bg-blue-100 text-blue-800" },
  { value: "en_curso", label: "En Curso", color: "bg-green-100 text-green-800" },
  { value: "completada", label: "Completada", color: "bg-gray-100 text-gray-800" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-100 text-red-800" },
] as const;

export type CategoriaVehiculo = (typeof CATEGORIAS)[number]["value"];
export type TipoTransmision = (typeof TRANSMISIONES)[number]["value"];
export type TipoCombustible = (typeof COMBUSTIBLES)[number]["value"];
export type EstadoReserva = (typeof ESTADOS_RESERVA)[number]["value"];
