import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const zhIndexPath = new URL('../bazi-app-ch/index.html', import.meta.url);
const enIndexPath = new URL('../bazi-app-en/index.html', import.meta.url);
const zhPaywallPath = new URL('../bazi-app-ch/test-unlock.html', import.meta.url);

const zh = readFileSync(zhIndexPath, 'utf8');
const en = readFileSync(enIndexPath, 'utf8');

assert.ok(existsSync(zhPaywallPath), 'Chinese standalone site should still include its dedicated test unlock page.');
assert.match(zh, /test-unlock\.html/i, 'Chinese standalone site should still use the test unlock flow.');
assert.doesNotMatch(en, /test-unlock\.html/i, 'English standalone site should no longer use the test unlock flow.');
assert.match(en, /\/api\/orders-create/i, 'English standalone site should move to the backend payment flow.');

console.log('mixed unlock/payment flow checks passed');
