import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../bazi-app-en/index.html', import.meta.url), 'utf8');

function extractObjectLiteral(source, variableName, nextMarker) {
  const startToken = `const ${variableName} = `;
  const startIndex = source.indexOf(startToken);
  assert.ok(startIndex >= 0, `Could not locate ${variableName} in index.html`);
  const objectStart = source.indexOf('{', startIndex);
  assert.ok(objectStart >= 0, `Could not locate start of ${variableName}`);
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  for (let index = objectStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }
    if (char === '\'' || char === '"' || char === '`') {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(objectStart, index + 1);
        return vm.runInNewContext(`(${literal})`);
      }
    }
  }
  assert.fail(`Could not locate end of ${variableName}`);
}

const enhancedRegions = extractObjectLiteral(html, 'enhancedRegions', 'englishContinentOptions');
const englishCountriesByContinent = extractObjectLiteral(html, 'englishCountriesByContinent', 'englishCitiesByCountryRegion');
const englishCitiesByCountryRegion = extractObjectLiteral(html, 'englishCitiesByCountryRegion', 'supplementalEuropeanRegions');
const supplementalEuropeanRegions = extractObjectLiteral(html, 'supplementalEuropeanRegions', 'supplementalEuropeanCities');
const supplementalEuropeanCities = extractObjectLiteral(html, 'supplementalEuropeanCities', 'capitalCityFallbackByCountry');
const capitalCityFallbackByCountry = extractObjectLiteral(html, 'capitalCityFallbackByCountry', 'yinyangByStem');

for (const [code, regions] of Object.entries(supplementalEuropeanRegions)) {
  assert.ok(regions.length >= 1, `${code} should expose at least one supplemental region.`);
}

assert.ok(supplementalEuropeanRegions.BG.length >= 5, 'Bulgaria should expose multiple real regions.');
assert.equal(supplementalEuropeanCities.BG['Sofia City'][0], 'Sofia');

const europeCodes = englishCountriesByContinent.Europe;
const unsupportedEurope = europeCodes.filter(code => !enhancedRegions[code] && !supplementalEuropeanRegions[code] && !capitalCityFallbackByCountry[code]);
assert.equal(unsupportedEurope.length, 0, `Every European country should have explicit regions or at least a capital fallback. Missing: ${unsupportedEurope.join(', ')}`);

const unsupportedGlobal = Object.values(englishCountriesByContinent)
  .flat()
  .filter((code, index, array) => array.indexOf(code) === index)
  .filter(code => !enhancedRegions[code] && !supplementalEuropeanRegions[code] && !capitalCityFallbackByCountry[code] && code !== 'CN');
assert.equal(unsupportedGlobal.length, 0, `Every selectable country should have region/city fallback data. Missing: ${unsupportedGlobal.join(', ')}`);

assert.ok(capitalCityFallbackByCountry.AG, 'Global fallbacks should include small Caribbean countries.');
assert.ok(capitalCityFallbackByCountry.NG, 'Global fallbacks should include major African countries.');
assert.ok(capitalCityFallbackByCountry.QA, 'Global fallbacks should include Gulf countries.');

console.log('english location data coverage checks passed');
