import { handleOptions, json } from './_lib/http.js';

const rateLimitState = new Map();

function getClientKey(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'anonymous';
}

function isLimited(key, env) {
  const max = Number(env.RATE_LIMIT_MAX || 30);
  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS || 60000);
  const now = Date.now();
  const current = rateLimitState.get(key);
  if (!current || now - current.start > windowMs) {
    rateLimitState.set(key, { start: now, count: 1 });
    return false;
  }
  current.count += 1;
  if (current.count > max) return true;
  return false;
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith('/api/')) return context.next();
  const key = getClientKey(context.request);
  if (isLimited(key, context.env)) {
    return json({ ok: false, error: 'Too many requests. Please slow down.' }, { status: 429 });
  }
  console.log('api-request', JSON.stringify({
    at: new Date().toISOString(),
    path: url.pathname,
    method: context.request.method,
    ip: key
  }));
  return context.next();
}
