type RateLimitEntry = { count: number; resetAt: number };

import { createAdminClient } from "@/lib/supabase/admin";

const requests = new Map<string, RateLimitEntry>();

function clientAddress(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headers.get("x-real-ip")
    ?? "unknown";
}

export async function enforceRateLimit(request: Request, scope: string, max: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${clientAddress(request.headers)}`;
  const current = requests.get(key);
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  entry.count += 1;
  requests.set(key, entry);
  try {
    const { data, error } = await createAdminClient().rpc("consume_distributed_rate_limit", {
      p_scope: scope,
      p_client_key: clientAddress(request.headers),
      p_max_requests: max,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });
    if (!error && data === true) return null;
    if (!error) return Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  } catch {
    // Respaldo por instancia durante una indisponibilidad de Supabase.
  }
  return entry.count <= max ? null : Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
}
