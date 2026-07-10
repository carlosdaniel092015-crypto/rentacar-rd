import { z } from "zod";
import { startOfToday, differenceInDays, parseISO } from "date-fns";

export const reservaSchema = z
  .object({
    vehiculoId: z.string().uuid("ID de vehículo inválido"),
    nombreCliente: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(120, "El nombre es demasiado largo")
      .trim(),
    emailCliente: z
      .string()
      .email("Correo electrónico inválido")
      .max(160)
      .toLowerCase(),
    telefonoCliente: z
      .string()
      .regex(/^[\d\s+().-]{7,20}$/, "Teléfono inválido (ej: 809-555-1234)"),
    cedulaCliente: z
      .string()
      .min(4, "Documento inválido")
      .max(30, "Documento demasiado largo")
      .trim(),
    fechaInicio: z.string().refine((val) => {
      const date = parseISO(val);
      return date >= startOfToday();
    }, "La fecha de inicio no puede ser en el pasado"),
    fechaFin: z.string(),
    notas: z.string().max(500, "Las notas no pueden exceder 500 caracteres").optional(),
    // Clave de idempotencia: el cliente la genera una vez por formulario. Si el
    // mismo envío llega dos veces, el servidor devuelve la reserva original en
    // vez de crear un duplicado. Opcional para no romper clientes antiguos.
    idempotencyKey: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      const inicio = parseISO(data.fechaInicio);
      const fin = parseISO(data.fechaFin);
      return fin >= inicio;
    },
    { message: "La fecha de fin debe ser posterior a la fecha de inicio", path: ["fechaFin"] }
  )
  .refine(
    (data) => {
      const inicio = parseISO(data.fechaInicio);
      const fin = parseISO(data.fechaFin);
      return differenceInDays(fin, inicio) <= 90;
    },
    { message: "La reserva no puede exceder 90 días", path: ["fechaFin"] }
  );

export type ReservaFormData = z.infer<typeof reservaSchema>;
