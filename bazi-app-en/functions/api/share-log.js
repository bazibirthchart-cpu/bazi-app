import { handleOptions, json, methodNotAllowed, readJson } from '../_lib/http.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();
  const payload = await readJson(context.request);
  const entry = {
    at: new Date().toISOString(),
    ip: context.request.headers.get('CF-Connecting-IP') || context.request.headers.get('x-forwarded-for') || 'unknown',
    platform: payload.platform || 'unknown',
    action: payload.action || 'share',
    detail: payload.detail || null
  };
  console.log('share-log', JSON.stringify(entry));
  return json({ ok: true, entry });
}
