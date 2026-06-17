import { handleOptions, json, methodNotAllowed } from '../_lib/http.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'GET') return methodNotAllowed();
  return json({ ok: true, service: 'bazi-app-backend', date: new Date().toISOString() });
}
