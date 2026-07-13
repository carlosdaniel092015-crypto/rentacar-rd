# SOP — Gestión de Flota

**Proceso:** Alta, mantenimiento y disponibilidad de vehículos
**Sistema:** Panel admin (`/admin/vehiculos`, `/admin/categorias`)
**Responsable del proceso:** Principal (CEO/líder) — puede delegar a un miembro con acceso al módulo `vehiculos`

## 1. Objetivo
Mantener el catálogo de vehículos preciso (precio, estado, disponibilidad) para evitar reservas sobre vehículos no aptos y maximizar el uso de la flota.

## 2. Alcance
Desde la incorporación de un vehículo nuevo a la flota hasta su baja, incluyendo mantenimiento preventivo y correctivo.

## 3. Roles y accesos
| Rol | Cargo sugerido | Acceso (módulo) | Responsabilidad |
|---|---|---|---|
| Principal | CEO / Fundador | Total | Decisiones de compra/baja de vehículos |
| Miembro | Gerente de Flota | `vehiculos`, `categorias` | Alta, edición, marcar disponible/no disponible |
| Miembro | Agente de Reservas | `reservas` (lectura cruzada) | Reporta incidencias detectadas al entregar/recibir vehículos |

## 4. Procedimiento

### 4.1 Alta de un vehículo nuevo
1. Crear la categoría en `/admin/categorias` si no existe.
2. En `/admin/vehiculos` → "Nuevo vehículo": completar marca, modelo, año, transmisión, combustible, pasajeros, precio/día, fotos y características.
3. Dejar `disponible = true` solo cuando el vehículo esté físicamente listo (papeles, limpieza, inspección).

### 4.2 Mantenimiento preventivo/correctivo
1. Al programar mantenimiento, marcar el vehículo como **no disponible** de inmediato (evita que se reserve mientras está en taller).
   - Si ya tiene reservas activas que se solapan con el mantenimiento, coordinar con el agente de reservas para reasignar al cliente a otro vehículo antes de continuar.
2. Registrar el mantenimiento (fecha, motivo, costo) — hasta tanto no exista un módulo dedicado, usar el campo `descripcion` o una hoja de cálculo externa enlazada desde aquí.
3. Al finalizar, marcar `disponible = true` nuevamente.

### 4.3 Baja de un vehículo
1. Verificar que no tenga reservas en estado `pendiente`, `confirmada` o `en_curso` (la base de datos bloquea el borrado si tiene reservas asociadas — `on delete restrict`).
2. Marcar `disponible = false` de forma permanente o eliminarlo del catálogo si ya no es parte de la flota.

## 5. Métricas (KPIs)

| Métrica | Fórmula | Meta | Frecuencia |
|---|---|---|---|
| Disponibilidad de flota | vehículos `disponible = true` / total vehículos activos | ≥ 85% | Semanal |
| Utilización por vehículo | días en `en_curso`/`completada` por vehículo / días del período | ≥ 60% (revisar vehículos por debajo para reubicar precio o promocionar) | Mensual |
| Tiempo fuera de servicio | días con `disponible = false` por mantenimiento / días del período | ≤ 10% | Mensual |
| Vehículos sin reservas en 30 días | conteo de vehículos `disponible = true` sin ninguna reserva en los últimos 30 días | Investigar si > 20% de la flota | Mensual |
| Antigüedad promedio de la flota | promedio de (año actual − `anio`) | Seguimiento, sin meta fija | Trimestral |

**Fuente de datos:** tabla `vehiculos` y `reservas` en Supabase; el dashboard `/admin` ya muestra el conteo de vehículos totales y disponibles.

## 6. Revisión del SOP
Revisar trimestralmente, o al incorporar 5+ vehículos nuevos a la flota en un solo trimestre (puede requerir ajustar el proceso de alta).
