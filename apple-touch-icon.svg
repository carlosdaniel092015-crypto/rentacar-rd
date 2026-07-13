# SOP — Gestión de Reservas

**Proceso:** Operación diaria de reservas de vehículos
**Sistema:** Panel admin (`/admin/reservas`) + API (`/api/reservas`)
**Responsable del proceso:** Principal (CEO/líder) — puede delegar a un miembro con acceso al módulo `reservas`

## 1. Objetivo
Garantizar que toda solicitud de reserva (web, WhatsApp o automatización) se confirme, gestione y cierre de forma consistente, sin dobles reservas y con el cliente informado en cada etapa.

## 2. Alcance
Desde que se recibe una solicitud de reserva hasta que el vehículo es devuelto y la reserva queda `completada` o `cancelada`.

## 3. Roles y accesos requeridos
| Rol | Cargo sugerido | Acceso (módulo) | Responsabilidad |
|---|---|---|---|
| Principal | CEO / Fundador | Total | Supervisión, resolución de excepciones |
| Miembro | Agente de Reservas | `reservas` | Confirmar, dar seguimiento, cambiar estado |
| Miembro | Agente de Flota | `vehiculos`, `reservas` | Verificar disponibilidad física antes de confirmar |

## 4. Estados de una reserva
`pendiente` → `confirmada` → `en_curso` → `completada` (o `cancelada` en cualquier punto antes de `completada`).

## 5. Procedimiento

1. **Recepción** — La reserva entra por uno de tres canales:
   - Formulario web (`POST /api/reservas`) → queda en `pendiente` automáticamente.
   - WhatsApp/automatización n8n → mismo endpoint, mismo estado inicial.
   - Llamada telefónica → el agente la crea manualmente desde `/admin/reservas` o vía API.
2. **Verificación (dentro de 2 horas hábiles)** — El agente de reservas revisa en `/admin/reservas`:
   - Que el vehículo esté físicamente disponible (coordinar con flota si hay duda).
   - Que los datos del cliente (cédula, teléfono) sean válidos.
3. **Confirmación** — Cambiar estado a `confirmada` desde el selector de estado. El sistema no reenvía email automático en este paso; el agente contacta al cliente por WhatsApp/teléfono para confirmar fecha y punto de entrega.
4. **Entrega del vehículo** — El día de inicio, marcar `en_curso` solo cuando el vehículo fue entregado físicamente.
5. **Cierre** — Al devolver el vehículo, marcar `completada`. Si el cliente cancela o no se presenta, marcar `cancelada` (libera el vehículo para otras fechas inmediatamente, gracias al constraint anti-solapamiento de la base de datos).
6. **Excepciones** — Solapamientos, fraude sospechado o disputas de pago se escalan al Principal.

## 6. Métricas (KPIs)

| Métrica | Fórmula | Meta | Frecuencia |
|---|---|---|---|
| Tiempo de confirmación | hora `confirmada` − hora `created_at` | ≤ 2 horas hábiles | Por reserva / revisión semanal |
| Tasa de conversión | reservas `confirmada`+ / total reservas `pendiente` recibidas | ≥ 70% | Mensual |
| Tasa de cancelación | reservas `cancelada` / total reservas del período | ≤ 15% | Mensual |
| Ocupación de flota | días reservados (`en_curso`+`completada`) / (vehículos disponibles × días del período) | ≥ 60% | Mensual |
| Ingreso confirmado del mes | suma de `total` en reservas con estado `confirmada`, `en_curso` o `completada` creadas en el mes | Definir meta por temporada | Mensual (ya disponible en `/admin` dashboard) |
| Reservas sin atender > 4h | reservas en `pendiente` con `created_at` hace más de 4 horas | 0 | Diaria |

**Fuente de datos:** tabla `reservas` en Supabase y panel `/admin` (dashboard ya muestra reservas pendientes y total del mes). Para las métricas de tiempo de confirmación se requiere consultar `updated_at` vs `created_at` por reserva (puede automatizarse vía n8n leyendo `GET /api/reservas`).

## 7. Revisión del SOP
El Principal revisa este procedimiento y sus métricas cada trimestre, o antes si la tasa de cancelación supera el 20% en un mes.
