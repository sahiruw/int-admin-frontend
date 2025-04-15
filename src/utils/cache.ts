const cache = new Map<string, { data: any; expiry: number }>();

export function setCache(key: string, data: any, ttl = 300) {
  const expiry = Date.now() + ttl * 1000; // ttl in seconds
  cache.set(key, { data, expiry });
}

export function getCache(key: string) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function clearCacheMatchingKeyPattern(pattern: string) {
    const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  }