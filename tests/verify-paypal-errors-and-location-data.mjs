import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createPayPalOrder } from '../bazi-app-en/functions/_lib/paypal.js';

const html = readFileSync(new URL('../bazi-app-en/index.html', import.meta.url), 'utf8');

function extractObjectLiteral(source, variableName, nextMarker) {
  const pattern = new RegExp(`const ${variableName} = (\\{[\\s\\S]*?\\n    \\});\\n    const ${nextMarker}`, 'm');
  const match = source.match(pattern);
  assert.ok(match, `Could not locate ${variableName} in index.html`);
  return vm.runInNewContext(`(${match[1]})`);
}

const enhancedRegions = extractObjectLiteral(html, 'enhancedRegions', 'englishContinentOptions');
const englishCountriesByContinent = extractObjectLiteral(html, 'englishCountriesByContinent', 'englishCitiesByCountryRegion');
const englishCitiesByCountryRegion = extractObjectLiteral(html, 'englishCitiesByCountryRegion', 'chinaProvinceEnglish');

assert.ok(englishCountriesByContinent.Europe.includes('DE'), 'Europe should include Germany.');
assert.ok(englishCountriesByContinent.Europe.includes('FR'), 'Europe should include France.');
assert.ok(englishCountriesByContinent.Europe.includes('IT'), 'Europe should include Italy.');

assert.ok(enhancedRegions.DE.length >= 16, 'Germany should expose major states.');
assert.ok(enhancedRegions.FR.length >= 13, 'France should expose major regions.');
assert.ok(enhancedRegions.IT.length >= 20, 'Italy should expose major regions.');

for (const [countryCode, minimumStates] of [['DE', 16], ['FR', 13], ['IT', 20], ['BE', 3]]) {
  const states = enhancedRegions[countryCode];
  const citiesByState = englishCitiesByCountryRegion[countryCode] || {};
  assert.ok(states.length >= minimumStates, `${countryCode} should expose enough state/region options.`);
  states.forEach(({ en }) => {
    if (citiesByState[en]) {
      assert.ok(citiesByState[en].length >= 1, `${countryCode}/${en} should provide at least one city.`);
    }
  });
}

globalThis.fetch = async (url) => {
  if (String(url).includes('/v1/oauth2/token')) {
    return {
      ok: true,
      json: async () => ({ access_token: 'sandbox-token' })
    };
  }
  return {
    ok: false,
    status: 422,
    json: async () => ({
      name: 'UNPROCESSABLE_ENTITY',
      message: 'PayPal sandbox rejected the order',
      details: [{ issue: 'CURRENCY_MISMATCH' }]
    })
  };
};

await assert.rejects(
  () => createPayPalOrder(
    {
      PAYPAL_CLIENT_ID: 'client',
      PAYPAL_CLIENT_SECRET: 'secret',
      PAYPAL_ENV: 'sandbox',
      PAYPAL_CURRENCY: 'EUR',
      PAYPAL_AMOUNT: '9.99'
    },
    { id: 'order-123' },
    'https://example.com/return',
    'https://example.com/cancel'
  ),
  error => {
    assert.match(error.message, /PayPal order creation failed \(422\)/);
    assert.match(error.message, /PayPal sandbox rejected the order/);
    assert.match(error.message, /CURRENCY_MISMATCH/);
    return true;
  }
);

console.log('paypal error and english location data checks passed');
