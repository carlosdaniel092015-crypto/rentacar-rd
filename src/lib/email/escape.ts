// Escapa datos provistos por el usuario antes de interpolarlos en HTML de
// correos. Los clientes de correo no ejecutan <script>, pero sin esto un
// nombre/comentario malicioso puede inyectar markup y falsificar contenido
// del mensaje (phishing, enlaces falsos) en la bandeja del admin o cliente.
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
