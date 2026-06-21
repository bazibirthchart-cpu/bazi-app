# Asia Location Data Enrichment Design

## Scope

This design extends the English standalone site location dataset beyond Europe:

- Site in scope: `bazi-app-en`
- Geography in scope for this pass: first-wave Asia coverage
- Out of scope for this pass: payment flow, report generation, Chinese site

## Goal

Raise Asia from capital-fallback coverage to usable region-and-city selection for the countries most likely to appear in paid traffic.

## First-Wave Countries

The first wave prioritizes broad practical coverage for:

- Afghanistan
- Armenia
- Azerbaijan
- Bahrain
- Bangladesh
- Bhutan
- Brunei
- Cambodia
- Georgia
- Hong Kong
- Iran
- Iraq
- Israel
- Jordan
- Kazakhstan
- Kuwait
- Kyrgyzstan
- Laos
- Lebanon
- Maldives
- Mongolia
- Myanmar
- Nepal
- North Korea
- Oman
- Pakistan
- Qatar
- Sri Lanka
- Syria
- Taiwan
- Tajikistan
- Timor-Leste
- Turkmenistan
- Uzbekistan
- Yemen
- Macau

## Completion Standard

1. Each first-wave country exposes several meaningful region choices.
2. Each exposed region has at least one real city.
3. `Other / Not listed` stays available.
4. Existing fallback behavior remains intact for countries outside the enriched set.
5. Automated checks verify the new region/city coverage.
