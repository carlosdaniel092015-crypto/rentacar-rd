# SOP — Automatización con n8n

**Proceso:** Consultas de disponibilidad y creación/seguimiento de reservas vía automatización externa
**Sistema:** n8n (HTTP Request) ↔ API REST de Alma 3D Rent Card (`/api/vehiculos`, `/api/reservas`)
**Responsable del proceso:** Principal (CEO/líder) — acceso exclusivo al módulo `automatizacion`

## 1. Objetivo
Permitir que flujos externos (n8n, bots de WhatsApp, CRMs) consulten disponibilidad y gestionen reservas sin intervención manual, manteniendo la misma integridad de datos que el sitio web.

## 2. Alcance
Cubre la integración técnica y operativa entre n8n y la API; no reemplaza el SOP de Gestión de Reservas, que sigue aplicando una vez la reserva existe en el sistema.

## 3. Roles y accesos
| Rol | Responsabilidad |
|---|---|
| Principal | Único que puede generar/rotar la `AUTOMATION_API_KEY`, dar de alta nuevos flujos de n8n, y revisar logs de automatización |
| Agente de Reservas | Da seguimiento a las reservas creadas por automatización igual que las manuales (SOP 01) |

## 4. Endpoints disponibles

| Acción | Endpoint | Auth |
|---|---|---|
| Consultar disponibilidad | `GET /api/vehiculos?fechaInicio=&fechaFin=&categoria=&precioMax=` | Pública |
| Crear reserva | `POST /api/reservas` | Pública (rate-limited) |
| Buscar reservas | `GET /api/reservas?cedula=&email=&estado=` | Header `x-api-key` |
| Detalle de reserva | `GET /api/reservas/{id}` | Header `x-api-key` |
| Cambiar estado de reserva | `PATCH /api/reservas/{id}` body `{estado}` | Header `x-api-key` |

## 5. Procedimiento de configuración de un flujo nuevo en n8n

1. El Principal genera la `AUTOMATION_API_KEY` (valor aleatorio, ej. `openssl rand -hex 24`) y la configura como variable de entorno en Vercel (**nunca** en el flujo de n8n en texto plano si n8n es compartido — usar su gestor de credenciales).
2. En n8n, crear una credencial de tipo "Header Auth" con `x-api-key` = la clave.
3. Construir el flujo: nodo Webhook/Trigger (ej. mensaje de WhatsApp) → HTTP Request a `GET /api/vehiculos` con filtros → HTTP Request `POST /api/reservas` → respuesta al usuario.
4. Probar en un entorno de prueba antes de activar el flujo en producción.
5. Documentar el flujo (nombre, propósito, fecha de alta) en la bitácora de automatizaciones (ver sección 7).

## 6. Métricas (KPIs)

| Métrica | Fórmula | Meta | Frecuencia |
|---|---|---|---|
| Reservas creadas por automatización | reservas cuyo origen sea n8n (etiquetar en `notas` o campo futuro `origen`) / total reservas | Visibilidad, sin meta fija inicialmente | Mensual |
| Tasa de error de la API | respuestas con status ≥ 500 / total de requests a `/api/vehiculos` + `/api/reservas` | < 1% | Semanal (vía logs en `audit_logs` tipo `error`) |
| Tiempo de respuesta de disponibilidad | latencia de `GET /api/vehiculos` | < 1.5s p95 | Continuo (monitor externo o n8n) |
| Intentos no autorizados | respuestas 401 en endpoints con `x-api-key` | Investigar si > 5/día (posible clave filtrada) | Diaria |
| Disponibilidad del flujo | % de ejecuciones de n8n sin error | ≥ 98% | Semanal (panel de ejecuciones de n8n) |

**Fuente de datos:** logs de ejecución de n8n + tabla `audit_logs` (tipo `error`) en Supabase, consultable desde `/admin/logs` (requiere acceso al módulo `logs`).

## 7. Bitácora de automatizaciones activas
Mantener un registro simple (puede ser esta misma tabla, ampliada manualmente) de cada flujo activo:

| Flujo | Propósito | Fecha de alta | Responsable |
|---|---|---|---|
| _(pendiente de completar al activar el primer flujo)_ | | | |

## 8. Rotación de credenciales
Rotar `AUTOMATION_API_KEY` cada 6 meses o inmediatamente si se sospecha una filtración. Al rotar, actualizar la variable en Vercel y en todas las credenciales de n8n el mismo día (la API rechaza la clave anterior de inmediato).

## 9. Revisión del SOP
Revisar trimestralmente junto con el SOP de Gestión de Reservas, o al agregar un nuevo flujo de automatización.
