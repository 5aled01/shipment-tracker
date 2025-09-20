// Extremely small in-memory limiter (good for single-node, local dev)
const hits = new Map<string, { count: number; ts: number }>();


export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
const now = Date.now();
const rec = hits.get(key);
if (!rec || now - rec.ts > windowMs) {
hits.set(key, { count: 1, ts: now });
return { ok: true, remaining: limit - 1 };
}
if (rec.count >= limit) return { ok: false, remaining: 0 };
rec.count += 1;
return { ok: true, remaining: limit - rec.count };
}