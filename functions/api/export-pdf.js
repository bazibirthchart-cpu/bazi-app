import { buildCalculation } from '../_lib/bazi.js';
import { binary, handleOptions, methodNotAllowed, readJson } from '../_lib/http.js';
import { buildReport } from '../_lib/report.js';
import { buildPdfBuffer } from '../_lib/pdf.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();
  const payload = await readJson(context.request);
  const language = payload.language || 'en';
  const calculation = payload.calculation || buildCalculation(payload.input || payload);
  const report = payload.report || buildReport(calculation, language);
  const pdfBuffer = await buildPdfBuffer(calculation, report, language);
  return binary(pdfBuffer, 'application/pdf', 'elements-palette-report.pdf');
}
