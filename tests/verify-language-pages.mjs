import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const zh = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const en = readFileSync(new URL('../index-en.html', import.meta.url), 'utf8');

assert.match(zh, /<html lang="zh-CN">/i, 'Chinese page should declare zh-CN at the top.');
assert.match(en, /<html lang="en">/i, 'English page should declare en at the top.');

assert.match(
  zh,
  /id="btn-lang-en"[^>]+onclick="navigateToLanguage\('en'\)"/,
  'Chinese page English button should jump to the English page.'
);
assert.match(
  en,
  /id="btn-lang-zh"[^>]+onclick="navigateToLanguage\('zh'\)"/,
  'English page Chinese button should jump to the Chinese page.'
);
assert.match(
  en,
  /<button class="lang-btn active" id="btn-lang-en"/,
  'English page should mark the English button active by default.'
);
assert.match(
  zh,
  /<button class="lang-btn active" id="btn-lang-zh"/,
  'Chinese page should mark the Chinese button active by default.'
);

assert.match(
  zh,
  /function navigateToLanguage\(lang\)/,
  'Chinese page should expose navigation-based language switching.'
);
assert.match(
  en,
  /function navigateToLanguage\(lang\)/,
  'English page should expose navigation-based language switching.'
);

console.log('language page checks passed');
