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
assert.doesNotMatch(zh, /YOUR-ENGLISH-SITE/i, 'Chinese site should not keep the English placeholder URL.');
assert.doesNotMatch(en, /YOUR-CHINESE-SITE/i, 'English site should not keep the Chinese placeholder URL.');
assert.match(zh, /https:\/\/bazi-app-en\.pages\.dev\/?/i, 'Chinese site should link to the real English site.');
assert.match(en, /https:\/\/bazi-app-ch\.pages\.dev\/?/i, 'English site should link to the real Chinese site.');
assert.doesNotMatch(zh, /<div class="lang-switcher">/i, 'Chinese standalone site should not render the language switcher.');
assert.doesNotMatch(en, /<div class="lang-switcher">/i, 'English standalone site should not render the language switcher.');

console.log('separate site checks passed');
