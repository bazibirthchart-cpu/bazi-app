import assert from 'node:assert/strict';

import { buildCalculation } from '../bazi-app-en/functions/_lib/bazi.js';
import { buildReport } from '../bazi-app-en/functions/_lib/report.js';
import { buildPdfBuffer } from '../bazi-app-en/functions/_lib/pdf.js';

const payload = {
  name: 'Test User',
  gender: 'female',
  birthDate: '1980-06-28',
  birthTime: '08:37',
  isDST: false,
  longitude: 13.405,
  locationLabel: 'Berlin, Germany'
};

const calculation = buildCalculation(payload);
const report = buildReport(calculation, 'en');
const pdfBuffer = await buildPdfBuffer(calculation, report, 'en');

assert.ok(Buffer.isBuffer(pdfBuffer), 'English PDF export should return a Buffer.');
assert.ok(pdfBuffer.length > 1000, 'English PDF export should generate a non-empty PDF file.');

console.log('english pdf buffer checks passed');
