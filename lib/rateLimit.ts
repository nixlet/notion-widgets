// A minimal login-attempt throttle, to slow down password guessing against
// /api/login. Same Redis-or-file-fallback pattern as lib/store.ts, kept
// separate since it's keyed by request IP rather than by app data.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX_ATTEMPTS = 8;

// In-memory fallback for local dev (no Redis). Not shared across server
// instances, which is fine - Railway production always has Redis configured.
const memory = new Map<string, { count: number; resetAt: number }>();

async function redis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

export async function tooManyLoginAttempts(key: string): Promise<boolean> {
  if (useRedis) {
    const kv = await redis();
    const count = (await kv.get<number>(`loginfail:${key}`)) ?? 0;
    return count >= MAX_ATTEMPTS;
  }
  const entry = memory.get(key);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export async function recordLoginFailure(key: string): Promise<void> {
  if (useRedis) {
    const kv = await redis();
    const count = await kv.incr(`loginfail:${key}`);
    if (count === 1) await kv.expire(`loginfail:${key}`, WINDOW_SECONDS);
    return;
  }
  const entry = memory.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    memory.set(key, { count: 1, resetAt: Date.now() + WINDOW_SECONDS * 1000 });
  } else {
    entry.count += 1;
  }
}

export async function clearLoginFailures(key: string): Promise<void> {
  if (useRedis) {
    const kv = await redis();
    await kv.del(`loginfail:${key}`);
    return;
  }
  memory.delete(key);
}

export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
