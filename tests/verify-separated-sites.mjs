import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

assert.equal(
  existsSync(new URL('../bazi-app-ch/index.html', import.meta.url)),
  true,
  'Chinese standalone site root should exist.'
);

assert.equal(
  existsSync(new URL('../bazi-app-en/index.html', import.meta.url)),
  true,
  'English standalone site root should exist.'
);

const zh = readFileSync(new URL('../bazi-app-ch/index.html', import.meta.url), 'utf8');
const en = readFileSync(new URL('../bazi-app-en/index.html', import.meta.url), 'utf8');

assert.match(zh, /<html lang="zh-CN">/i, 'Chinese site should declare zh-CN.');
assert.match(en, /<html lang="en">/i, 'English site should declare en.');

console.log('separate site checks passed');
