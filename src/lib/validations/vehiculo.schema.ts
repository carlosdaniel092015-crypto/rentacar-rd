import { z } from "zod";

export const vehiculoSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(120).trim(),
  marca: z.string().min(1, "Marca requerida").max(60).trim(),
  modelo: z.string().min(1, "Modelo requerido").max(60).trim(),
  anio: z
    .number()
    .int()
    .min(1990, "El año debe ser 1990 o posterior")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  categoria: z.enum(["economico", "sedan", "suv", "pickup", "van", "lujo", "deportivo"]),
  transmision: z.enum(["manual", "automatica"]),
  combustible: z.enum(["gasolina", "diesel", "hibrido", "electrico"]),
  pasajeros: z.number().int().min(1).max(20),
  precio_dia: z.number().positive("El precio debe ser mayor a 0"),
  disponible: z.boolean(),
  imagen_url: z.string().url().optional(),
  imagenes_urls: z.array(z.string().url()).optional(),
  descripcion: z.string().max(2000).optional(),
  caracteristicas: z.array(z.string().max(100)).optional(),
});

export type VehiculoFormData = z.infer<typeof vehiculoSchema>;
