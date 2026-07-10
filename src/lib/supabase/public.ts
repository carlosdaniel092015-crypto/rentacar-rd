import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Cliente anónimo SIN cookies, para lecturas de datos públicos (catálogo, home).
// Al no leer cookies ni sesión, la página que lo usa puede cachearse con ISR
// (`export const revalidate = N`) y servirse desde la CDN de Vercel en vez de
// pegarle a la base de datos en cada visita. Solo lee lo que la RLS permite a
// `anon`, así que nunca expone datos privados.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
