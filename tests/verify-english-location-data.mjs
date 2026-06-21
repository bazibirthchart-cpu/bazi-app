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
const supplementalEuropeanCities = extractObjectLiteral(html, 'supplementalEuropeanCities', 'supplementalAsiaRegions');
const supplementalAsiaRegions = extractObjectLiteral(html, 'supplementalAsiaRegions', 'supplementalAsiaCities');
const supplementalAsiaCities = extractObjectLiteral(html, 'supplementalAsiaCities', 'supplementalAfricaRegions');
const supplementalAfricaRegions = extractObjectLiteral(html, 'supplementalAfricaRegions', 'supplementalAfricaCities');
const supplementalAfricaCities = extractObjectLiteral(html, 'supplementalAfricaCities', 'capitalCityFallbackByCountry');
const capitalCityFallbackByCountry = extractObjectLiteral(html, 'capitalCityFallbackByCountry', 'yinyangByStem');

for (const [code, regions] of Object.entries(supplementalEuropeanRegions)) {
  assert.ok(regions.length >= 1, `${code} should expose at least one supplemental region.`);
}

assert.ok(supplementalEuropeanRegions.BG.length >= 5, 'Bulgaria should expose multiple real regions.');
assert.equal(supplementalEuropeanCities.BG['Sofia City'][0], 'Sofia');
assert.ok(supplementalEuropeanCities.BG['Sofia City'].length >= 2, 'Bulgaria capital region should expose multiple city choices.');
assert.ok(supplementalEuropeanCities.CZ['South Moravian'].length >= 2, 'Czechia should expose multiple city choices for South Moravian.');
assert.ok(supplementalEuropeanCities.DK['Central Jutland'].length >= 2, 'Denmark should expose multiple city choices for Central Jutland.');
assert.ok(supplementalEuropeanCities.GR.Attica.length >= 2, 'Greece should expose multiple city choices for Attica.');
assert.ok(supplementalEuropeanCities.PL.Masovian.length >= 2, 'Poland should expose multiple city choices for Masovian.');
assert.ok(supplementalEuropeanCities.SE.Skane.length >= 2, 'Sweden should expose multiple city choices for Skane.');

for (const [code, regions] of Object.entries(supplementalAsiaRegions)) {
  assert.ok(regions.length >= 1, `${code} should expose at least one supplemental Asia region.`);
}

assert.ok(supplementalAsiaRegions.PK.length >= 4, 'Pakistan should expose multiple real regions.');
assert.ok(supplementalAsiaCities.PK.Punjab.length >= 3, 'Pakistan Punjab should expose multiple city choices.');
assert.ok(supplementalAsiaCities.HK['Hong Kong Island'].length >= 2, 'Hong Kong Island should expose multiple city choices.');
assert.ok(supplementalAsiaCities.TW['New Taipei'].length >= 2, 'Taiwan New Taipei should expose multiple city choices.');
assert.ok(supplementalAsiaCities.BD.Dhaka.length >= 2, 'Bangladesh Dhaka should expose multiple city choices.');
assert.ok(supplementalAsiaCities.KZ.Astana.length >= 2, 'Kazakhstan Astana should expose multiple city choices.');
assert.ok(supplementalAsiaCities.IL['Tel Aviv'].length >= 3, 'Israel Tel Aviv district should expose multiple city choices.');
assert.ok(supplementalAsiaCities.OM.Muscat.length >= 2, 'Oman Muscat should expose multiple city choices.');
assert.ok(supplementalAsiaCities.UZ.Fergana.length >= 3, 'Uzbekistan Fergana should expose multiple city choices.');
assert.ok(supplementalAsiaCities.NP.Bagmati.length >= 3, 'Nepal Bagmati should expose multiple city choices.');

for (const [code, regions] of Object.entries(supplementalAfricaRegions)) {
  assert.ok(regions.length >= 4, `${code} should expose multiple African regions.`);
}

assert.ok(supplementalAfricaCities.NG.Lagos.length >= 2, 'Nigeria Lagos should expose multiple city choices.');
assert.ok(supplementalAfricaCities.EG.Cairo.length >= 2, 'Egypt Cairo should expose multiple city choices.');
assert.ok(supplementalAfricaCities.KE.Nairobi.length >= 1, 'Kenya Nairobi should expose a city choice.');
assert.ok(supplementalAfricaCities.MA['Casablanca-Settat'].length >= 2, 'Morocco Casablanca-Settat should expose multiple city choices.');
assert.ok(supplementalAfricaCities.TZ['Dar es Salaam'].length >= 1, 'Tanzania Dar es Salaam should expose a city choice.');
assert.ok(supplementalAfricaCities.UG.Wakiso.length >= 2, 'Uganda Wakiso should expose multiple city choices.');

const europeCodes = englishCountriesByContinent.Europe;
const unsupportedEurope = europeCodes.filter(code => !enhancedRegions[code] && !supplementalEuropeanRegions[code] && !capitalCityFallbackByCountry[code]);
assert.equal(unsupportedEurope.length, 0, `Every European country should have explicit regions or at least a capital fallback. Missing: ${unsupportedEurope.join(', ')}`);

const asiaCodes = englishCountriesByContinent.Asia;
const unsupportedAsia = asiaCodes
  .filter(code => !enhancedRegions[code] && !supplementalAsiaRegions[code] && !capitalCityFallbackByCountry[code] && code !== 'CN');
assert.equal(unsupportedAsia.length, 0, `Every selectable Asian country should have explicit regions or at least a capital fallback. Missing: ${unsupportedAsia.join(', ')}`);

const unsupportedGlobal = Object.values(englishCountriesByContinent)
  .flat()
  .filter((code, index, array) => array.indexOf(code) === index)
  .filter(code => !enhancedRegions[code] && !supplementalEuropeanRegions[code] && !capitalCityFallbackByCountry[code] && code !== 'CN');
assert.equal(unsupportedGlobal.length, 0, `Every selectable country should have region/city fallback data. Missing: ${unsupportedGlobal.join(', ')}`);

assert.ok(capitalCityFallbackByCountry.AG, 'Global fallbacks should include small Caribbean countries.');
assert.ok(capitalCityFallbackByCountry.NG, 'Global fallbacks should include major African countries.');
assert.ok(capitalCityFallbackByCountry.QA, 'Global fallbacks should include Gulf countries.');

console.log('english location data coverage checks passed');
