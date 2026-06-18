import { buildCalculation } from '../_lib/bazi.js';
import { binary, handleOptions, methodNotAllowed, readJson } from '../_lib/http.js';
import { buildChartSvg } from '../_lib/image.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();
  const payload = await readJson(context.request);
  const calculation = payload.calculation || buildCalculation(payload.input || payload);
  const svg = buildChartSvg(calculation);
  return binary(svg, 'image/svg+xml; charset=utf-8', 'elements-palette-chart.svg');
}
