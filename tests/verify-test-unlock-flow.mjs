import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const zhIndexPath = new URL('../bazi-app-ch/index.html', import.meta.url);
const enIndexPath = new URL('../bazi-app-en/index.html', import.meta.url);
const zhPaywallPath = new URL('../bazi-app-ch/test-unlock.html', import.meta.url);
const enPaywallPath = new URL('../bazi-app-en/test-unlock.html', import.meta.url);

const zh = readFileSync(zhIndexPath, 'utf8');
const en = readFileSync(enIndexPath, 'utf8');

assert.ok(existsSync(zhPaywallPath), 'Chinese standalone site should include a dedicated test unlock page.');
assert.ok(existsSync(enPaywallPath), 'English standalone site should include a dedicated test unlock page.');

assert.doesNotMatch(zh, /unlockCtaBtn|startUnlockFlow/i, 'Chinese standalone site should not wait for a second unlock button on the report page.');
assert.doesNotMatch(en, /unlockCtaBtn|startUnlockFlow/i, 'English standalone site should not wait for a second unlock button on the report page.');

assert.match(zh, /new URL\('test-unlock\.html', window\.location\.href\)|window\.location\.href = unlockUrl\.toString\(\)/i, 'Chinese standalone site should redirect to the payment page from submit flow.');
assert.match(en, /new URL\('test-unlock\.html', window\.location\.href\)|window\.location\.href = unlockUrl\.toString\(\)/i, 'English standalone site should redirect to the payment page from submit flow.');

assert.match(zh, /刷新页面后会重新锁定|刷新后会重新锁定/, 'Chinese standalone site should warn that refresh will lock the report again.');
assert.match(en, /refreshing the page will lock it again|will lock again after refresh/i, 'English standalone site should warn that refresh will lock the report again.');

assert.match(zh, /premiumUnlocked|unlock=1/, 'Chinese standalone site should include a premium unlock return flow.');
assert.match(en, /premiumUnlocked|unlock=1/, 'English standalone site should include a premium unlock return flow.');

console.log('test unlock flow checks passed');
