import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditLogType = "admin_action" | "login" | "error" | "visit";
export type AuditLogLevel = "info" | "warn" | "error";

interface LogEventInput {
  type: AuditLogType;
  level?: AuditLogLevel;
  actorEmail?: string | null;
  ip?: string | null;
  path?: string | null;
  method?: string | null;
  message?: string;
  details?: Record<string, unknown>;
}

// Best-effort: nunca debe romper el flujo principal si falla el log.
export async function logEvent(input: LogEventInput) {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      type: input.type,
      level: input.level ?? "info",
      actor_email: input.actorEmail ?? null,
      ip: input.ip ?? null,
      path: input.path ?? null,
      method: input.method ?? null,
      message: input.message ?? null,
      details: input.details ?? {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch (err) {
    console.error("No se pudo escribir audit log:", err);
  }
}
