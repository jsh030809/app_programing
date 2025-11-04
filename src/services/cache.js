// Simple localStorage cache with TTL (in milliseconds)
// Data shape in storage: { ts: number, data: any }

const PREFIX = "weather:";

export function saveCache(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export function loadCacheRaw(key) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    if (!v) return null;
    return JSON.parse(v);
  } catch {
    return null;
  }
}

export function loadCache(key, ttlMs) {
  const entry = loadCacheRaw(key);
  if (!entry) return null;
  const fresh = Date.now() - entry.ts < ttlMs;
  return { data: entry.data, fresh, ts: entry.ts };
}

export function clearCache(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}

export function withCache(key, ttlMs, fetcher) {
  // Returns { cached, refreshed }
  const cached = loadCache(key, ttlMs);
  const refreshed = fetcher()
    .then((data) => {
      saveCache(key, data);
      return data;
    })
    .catch((e) => {
      // keep cache on failure
      throw e;
    });
  return { cached, refreshed };
}
