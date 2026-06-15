import { z } from "zod";

export const contactoSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(100).trim(),
  email: z.string().email("Correo inválido").max(160).toLowerCase(),
  telefono: z
    .string()
    .regex(/^[\d\s+().-]{7,20}$/, "Teléfono inválido")
    .optional()
    .or(z.literal("")),
  asunto: z.string().min(3, "Asunto requerido").max(150).trim(),
  mensaje: z.string().min(10, "El mensaje es demasiado corto").max(2000).trim(),
  _honeypot: z.string().max(0, "").optional(),
});

export type ContactoFormData = z.infer<typeof contactoSchema>;
