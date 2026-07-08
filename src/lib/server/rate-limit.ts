import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Store distribuido (Upstash Redis / Vercel KV) cuando está configurado.
// En su ausencia (dev local sin credenciales), cae a un Map en memoria del
// proceso — suficiente para desarrollo, pero NO seguro en serverless/producción
// porque no se comparte entre instancias ni sobrevive a un cold start.
const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] KV_REST_API_URL/TOKEN no configuradas: usando límite en memoria, " +
      "que no es efectivo en serverless. Configura Vercel KV / Upstash Redis."
  );
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(bucket: string, maxRequests: number, windowSeconds: number): Ratelimit | null {
  if (!redis) return null;
  const key = `${bucket}:${maxRequests}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      prefix: `ratelimit:${bucket}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

// Fallback en memoria (solo para dev sin Redis configurado).
const memoryStore = new Map<string, { count: number; reset: number }>();
const MEMORY_MAX_ENTRIES = 5000;

function checkMemory(bucket: string, identifier: string, maxRequests: number, windowSeconds: number): boolean {
  const key = `${bucket}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (memoryStore.size > MEMORY_MAX_ENTRIES) {
    for (const [k, v] of memoryStore) {
      if (now > v.reset) memoryStore.delete(k);
    }
  }

  const entry = memoryStore.get(key);
  if (!entry || now > entry.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// Límite deslizante compartido entre instancias (cuando Redis está configurado).
// bucket: namespace lógico del endpoint (ej. "reservas", "contacto", "login").
export async function checkRateLimit(
  bucket: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const limiter = getLimiter(bucket, maxRequests, windowSeconds);
  if (limiter) {
    const { success } = await limiter.limit(identifier);
    return success;
  }
  return checkMemory(bucket, identifier, maxRequests, windowSeconds);
}
