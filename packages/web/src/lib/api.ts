export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

type CacheEntry = { etag: string; body: any; ts: number };
const etagCache = new Map<string, CacheEntry>(); // key = METHOD + ' ' + URL

export async function api<T>(
  path: string,
  opts: RequestInit & { idempotency?: boolean; skipCache?: boolean } = {}
): Promise<{ data: T; etag?: string; status: number }> {
  const url = `${API_BASE}${path}`;
  const method = (opts.method || 'GET').toUpperCase();
  const cacheKey = `${method} ${url}`;

  const headers = new Headers(opts.headers || {});
  headers.set('Accept', 'application/json');
  if (!(opts.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  // Add authentication token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Idempotência para mutações
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && opts.idempotency !== false) {
    headers.set('Idempotency-Key', crypto.randomUUID());
  }

  // If-None-Match apenas para GETs cacheáveis
  if (method === 'GET' && !opts.skipCache) {
    const cached = etagCache.get(cacheKey);
    if (cached?.etag) headers.set('If-None-Match', cached.etag);
  }

  const res = await fetch(url, { ...opts, method, headers });

  // 304: retornar body em cache (se houver)
  if (res.status === 304 && method === 'GET') {
    const cached = etagCache.get(cacheKey);
    if (cached) {
      return { data: cached.body as T, etag: cached.etag, status: 304 };
    }
    // se não houver cache, cai pra buscar o body (não há) -> trate como erro leve:
    return { data: undefined as any, etag: undefined, status: 304 };
  }

  const etag = res.headers.get('ETag') ?? undefined;

  if (!res.ok) {
    // Limpa cache em erro de GET, só por segurança (opcional)
    if (method === 'GET') etagCache.delete(cacheKey);
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }

  // Sucesso com body JSON
  const json = await res.json();

  if (method === 'GET' && etag) {
    etagCache.set(cacheKey, { etag, body: json, ts: Date.now() });
  }
  // Invalidações simples de cache após mutações (poderia ser mais granular)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // invalidar listas e detalhes comuns
    for (const key of etagCache.keys()) {
      if (key.startsWith('GET ')) {
        if (key.includes('/projects') || key.includes('/notes')) etagCache.delete(key);
      }
    }
  }

  return { data: json as T, etag, status: res.status };
}
