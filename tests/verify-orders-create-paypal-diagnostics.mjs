import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../bazi-app-en/functions/api/orders-create.js', import.meta.url), 'utf8');

assert.match(
  source,
  /serverError\(\s*'Unable to create the payment order\.'\s*,\s*\{/,
  'orders-create should keep a user-friendly top-level error and pass detailed diagnostics separately.'
);

assert.match(
  source,
  /message:\s*error\?\.message\s*\|\|\s*String\(error\)/,
  'orders-create should include the underlying PayPal error message in diagnostics.'
);

console.log('orders-create PayPal diagnostics source check passed');
