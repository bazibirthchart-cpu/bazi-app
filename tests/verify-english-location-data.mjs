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
const supplementalAfricaCities = extractObjectLiteral(html, 'supplementalAfricaCities', 'supplementalOceaniaRegions');
const supplementalOceaniaRegions = extractObjectLiteral(html, 'supplementalOceaniaRegions', 'supplementalOceaniaCities');
const supplementalOceaniaCities = extractObjectLiteral(html, 'supplementalOceaniaCities', 'supplementalNorthAmericaRegions');
const supplementalNorthAmericaRegions = extractObjectLiteral(html, 'supplementalNorthAmericaRegions', 'supplementalNorthAmericaCities');
const supplementalNorthAmericaCities = extractObjectLiteral(html, 'supplementalNorthAmericaCities', 'supplementalSouthAmericaRegions');
const supplementalSouthAmericaRegions = extractObjectLiteral(html, 'supplementalSouthAmericaRegions', 'supplementalSouthAmericaCities');
const supplementalSouthAmericaCities = extractObjectLiteral(html, 'supplementalSouthAmericaCities', 'capitalCityFallbackByCountry');
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

for (const [code, regionMap] of Object.entries(supplementalAsiaCities)) {
  for (const [region, cities] of Object.entries(regionMap)) {
    assert.ok(cities.length >= 2, `${code} ${region} should expose at least two city choices.`);
  }
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
assert.ok(supplementalAfricaCities.CM.Centre.length >= 2, 'Cameroon Centre should expose multiple city choices.');
assert.ok(supplementalAfricaCities.DZ.Algiers.length >= 2, 'Algeria Algiers should expose multiple city choices.');
assert.ok(supplementalAfricaCities.CD.Kinshasa.length >= 1, 'DR Congo Kinshasa should expose a city choice.');
assert.ok(supplementalAfricaCities.GA.Estuaire.length >= 1, 'Gabon Estuaire should expose a city choice.');
assert.ok(supplementalAfricaCities.ML.Bamako.length >= 1, 'Mali Bamako should expose a city choice.');
assert.ok(supplementalAfricaCities.TN.Tunis.includes('Tunis'), 'Tunisia Tunis should include Tunis.');
assert.ok(supplementalAfricaCities.NA.Khomas.includes('Windhoek'), 'Namibia Khomas should include Windhoek.');
assert.ok(supplementalAfricaCities.ZM.Lusaka.includes('Lusaka'), 'Zambia Lusaka should include Lusaka.');
assert.ok(supplementalAfricaCities.ZW.Harare.includes('Harare'), 'Zimbabwe Harare should include Harare.');
assert.ok(enhancedRegions.ZA.length >= 5, 'South Africa should expose more major provinces.');
assert.ok(englishCitiesByCountryRegion.ZA['Eastern Cape'].includes('Gqeberha'), 'South Africa Eastern Cape should include Gqeberha.');

for (const [code, regions] of Object.entries(supplementalOceaniaRegions)) {
  assert.ok(regions.length >= 4, `${code} should expose multiple Oceania regions.`);
}

for (const [code, regionMap] of Object.entries(supplementalOceaniaCities)) {
  for (const [region, cities] of Object.entries(regionMap)) {
    assert.ok(cities.length >= 2, `${code} ${region} should expose at least two city choices.`);
  }
}

assert.ok(supplementalOceaniaCities.FJ['Central Division'].includes('Suva'), 'Fiji central division should include Suva.');
assert.ok(supplementalOceaniaCities.PG['National Capital District'].includes('Port Moresby'), 'Papua New Guinea should include Port Moresby.');
assert.ok(supplementalOceaniaCities.WS.Tuamasaga.includes('Apia'), 'Samoa Tuamasaga should include Apia.');
assert.ok(supplementalOceaniaCities.VU.Shefa.includes('Port Vila'), 'Vanuatu Shefa should include Port Vila.');

for (const [code, regions] of Object.entries(supplementalNorthAmericaRegions)) {
  assert.ok(regions.length >= 4, `${code} should expose multiple North America regions.`);
}

for (const [code, regionMap] of Object.entries(supplementalNorthAmericaCities)) {
  for (const [region, cities] of Object.entries(regionMap)) {
    assert.ok(cities.length >= 2, `${code} ${region} should expose at least two city choices.`);
  }
}

assert.ok(supplementalNorthAmericaCities.BS['New Providence'].includes('Nassau'), 'Bahamas New Providence should include Nassau.');
assert.ok(supplementalNorthAmericaCities.CR['San Jose'].includes('San Jose'), 'Costa Rica San Jose should include San Jose.');
assert.ok(supplementalNorthAmericaCities.DO['National District'].includes('Santo Domingo'), 'Dominican Republic should include Santo Domingo.');
assert.ok(supplementalNorthAmericaCities.GT.Guatemala.includes('Guatemala City'), 'Guatemala should include Guatemala City.');
assert.ok(supplementalNorthAmericaCities.PA.Panama.includes('Panama City'), 'Panama should include Panama City.');
assert.ok(enhancedRegions.MX.length >= 5, 'Mexico should expose more major states.');
assert.ok(englishCitiesByCountryRegion.MX['State of Mexico'].includes('Toluca'), 'Mexico State of Mexico should include Toluca.');

for (const [code, regions] of Object.entries(supplementalSouthAmericaRegions)) {
  assert.ok(regions.length >= 4, `${code} should expose multiple South America regions.`);
}

for (const [code, regionMap] of Object.entries(supplementalSouthAmericaCities)) {
  for (const [region, cities] of Object.entries(regionMap)) {
    assert.ok(cities.length >= 2, `${code} ${region} should expose at least two city choices.`);
  }
}

assert.ok(supplementalSouthAmericaCities.BO['La Paz'].includes('La Paz'), 'Bolivia La Paz should include La Paz.');
assert.ok(supplementalSouthAmericaCities.CL['Santiago Metropolitan'].includes('Santiago'), 'Chile should include Santiago.');
assert.ok(supplementalSouthAmericaCities.CO.Bogota.includes('Bogota'), 'Colombia should include Bogota.');
assert.ok(supplementalSouthAmericaCities.PE.Lima.includes('Lima'), 'Peru should include Lima.');
assert.ok(supplementalSouthAmericaCities.UY.Montevideo.includes('Montevideo'), 'Uruguay should include Montevideo.');
assert.ok(enhancedRegions.AR.length >= 5, 'Argentina should expose more major provinces.');
assert.ok(enhancedRegions.BR.length >= 5, 'Brazil should expose more major states.');
assert.ok(englishCitiesByCountryRegion.AR['Santa Fe'].includes('Rosario'), 'Argentina Santa Fe should include Rosario.');
assert.ok(englishCitiesByCountryRegion.BR.Bahia.includes('Salvador'), 'Brazil Bahia should include Salvador.');

const europeCodes = englishCountriesByContinent.Europe;
const unsupportedEurope = europeCodes.filter(code => !enhancedRegions[code] && !supplementalEuropeanRegions[code] && !capitalCityFallbackByCountry[code]);
assert.equal(unsupportedEurope.length, 0, `Every European country should have explicit regions or at least a capital fallback. Missing: ${unsupportedEurope.join(', ')}`);

const asiaCodes = englishCountriesByContinent.Asia;
const unsupportedAsia = asiaCodes
  .filter(code => !enhancedRegions[code] && !supplementalAsiaRegions[code] && !capitalCityFallbackByCountry[code] && code !== 'CN');
assert.equal(unsupportedAsia.length, 0, `Every selectable Asian country should have explicit regions or at least a capital fallback. Missing: ${unsupportedAsia.join(', ')}`);

const oceaniaCodes = englishCountriesByContinent.Oceania;
const unsupportedOceania = oceaniaCodes
  .filter(code => !enhancedRegions[code] && !supplementalOceaniaRegions[code] && !capitalCityFallbackByCountry[code]);
assert.equal(unsupportedOceania.length, 0, `Every selectable Oceania country should have explicit regions or at least a capital fallback. Missing: ${unsupportedOceania.join(', ')}`);

const africaCodes = englishCountriesByContinent.Africa;
const unsupportedAfricaLayered = africaCodes
  .filter(code => !enhancedRegions[code] && !supplementalAfricaRegions[code]);
assert.equal(unsupportedAfricaLayered.length, 0, `Every selectable African country should have explicit region and city data. Missing: ${unsupportedAfricaLayered.join(', ')}`);

const northAmericaCodes = englishCountriesByContinent['North America'];
const unsupportedNorthAmerica = northAmericaCodes
  .filter(code => !enhancedRegions[code] && !supplementalNorthAmericaRegions[code] && !capitalCityFallbackByCountry[code]);
assert.equal(unsupportedNorthAmerica.length, 0, `Every selectable North America country should have explicit regions or at least a capital fallback. Missing: ${unsupportedNorthAmerica.join(', ')}`);

const southAmericaCodes = englishCountriesByContinent['South America'];
const unsupportedSouthAmerica = southAmericaCodes
  .filter(code => !enhancedRegions[code] && !supplementalSouthAmericaRegions[code] && !capitalCityFallbackByCountry[code]);
assert.equal(unsupportedSouthAmerica.length, 0, `Every selectable South America country should have explicit regions or at least a capital fallback. Missing: ${unsupportedSouthAmerica.join(', ')}`);

const unsupportedGlobal = Object.values(englishCountriesByContinent)
  .flat()
  .filter((code, index, array) => array.indexOf(code) === index)
  .filter(code => !enhancedRegions[code] && !supplementalEuropeanRegions[code] && !capitalCityFallbackByCountry[code] && code !== 'CN');
assert.equal(unsupportedGlobal.length, 0, `Every selectable country should have region/city fallback data. Missing: ${unsupportedGlobal.join(', ')}`);

assert.ok(capitalCityFallbackByCountry.AG, 'Global fallbacks should include small Caribbean countries.');
assert.ok(capitalCityFallbackByCountry.NG, 'Global fallbacks should include major African countries.');
assert.ok(capitalCityFallbackByCountry.QA, 'Global fallbacks should include Gulf countries.');

console.log('english location data coverage checks passed');
