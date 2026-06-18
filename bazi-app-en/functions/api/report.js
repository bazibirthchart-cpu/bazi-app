import { buildCalculation } from '../_lib/bazi.js';
import { buildReport } from '../_lib/report.js';
import { handleOptions, json, methodNotAllowed, readJson } from '../_lib/http.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();
  const payload = await readJson(context.request);
  const language = payload.language || 'en';
  const calculation = payload.calculation || buildCalculation(payload.input || payload);
  const report = buildReport(calculation, language);
  return json({ ok: true, calculation, report });
}
