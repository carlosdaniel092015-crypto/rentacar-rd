import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, tieneAcceso } from "@/lib/server/equipo";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Logs | Admin" };
export const dynamic = "force-dynamic";

interface AuditLogRow {
  id: string;
  created_at: string;
  type: "admin_action" | "login" | "error" | "visit";
  level: "info" | "warn" | "error";
  actor_email: string | null;
  ip: string | null;
  path: string | null;
  method: string | null;
  message: string | null;
  details: Record<string, unknown>;
}

const TYPE_LABELS: Record<AuditLogRow["type"], string> = {
  admin_action: "Acción admin",
  login: "Login",
  error: "Error",
  visit: "Visita",
};

const LEVEL_VARIANT: Record<AuditLogRow["level"], "default" | "destructive" | "secondary"> = {
  info: "secondary",
  warn: "default",
  error: "destructive",
};

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  // El proxy.ts ya redirige a /admin si no tienes el módulo "logs"; esto es defensa adicional.
  const member = await getCurrentMember();
  if (!tieneAcceso(member, "logs")) notFound();

  const { type } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (type && type in TYPE_LABELS) {
    query = query.eq("type", type);
  }

  const { data: logsRaw } = await query;
  const logs = (logsRaw ?? []) as unknown as AuditLogRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="hidden text-2xl font-bold md:block">Logs</h1>
        <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
          Visible solo para roles con acceso a logs. Últimas {logs.length} entradas.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <FilterLink type={undefined} current={type} label="Todos" />
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <FilterLink key={key} type={key} current={type} label={label} />
        ))}
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-muted)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Actor</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Ruta</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">Mensaje</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--color-muted-foreground)]">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--color-muted)]/30">
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--color-muted-foreground)]">
                    {new Date(log.created_at).toLocaleString("es-DO")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={LEVEL_VARIANT[log.level]}>{TYPE_LABELS[log.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">{log.actor_email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {log.method ? `${log.method} ` : ""}{log.path ?? "—"}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={log.message ?? ""}>
                    {log.message ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{log.ip ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted-foreground)]">
                    Sin registros todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterLink({ type, current, label }: { type?: string; current?: string; label: string }) {
  const isActive = current === type || (!current && !type);
  const href = type ? `/admin/logs?type=${type}` : "/admin/logs";
  return (
    <a
      href={href}
      className={
        "px-3 py-1.5 rounded-[var(--radius)] text-sm font-medium transition-colors " +
        (isActive
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/70")
      }
    >
      {label}
    </a>
  );
}
