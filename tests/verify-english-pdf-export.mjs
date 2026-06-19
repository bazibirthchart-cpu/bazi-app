import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const enIndexPath = new URL('../bazi-app-en/index.html', import.meta.url);
const en = readFileSync(enIndexPath, 'utf8');

assert.match(
  en,
  /\/api\/export-pdf/,
  'English standalone site should call the backend PDF export endpoint before falling back to client-side PDF generation.'
);

console.log('english pdf export checks passed');
