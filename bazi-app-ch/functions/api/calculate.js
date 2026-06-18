import { buildCalculation } from '../_lib/bazi.js';
import { badRequest, handleOptions, json, methodNotAllowed, readJson } from '../_lib/http.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();
  const payload = await readJson(context.request);
  if (!payload.birthDate || !payload.birthTime || typeof payload.longitude !== 'number') {
    return badRequest('birthDate, birthTime, and longitude are required.');
  }
  const calculation = buildCalculation(payload);
  return json({ ok: true, calculation });
}
