# Europe Location Data Enrichment Design

## Scope

This design covers the English standalone site only:

- Site in scope: `bazi-app-en`
- Geography in scope for this pass: Europe
- Out of scope for this pass: China data, Chinese standalone site, payment flow changes

## Goal

Make the Europe location selector feel trustworthy and usable for real visitors by ensuring that:

1. Every European country already listed in the continent selector has non-empty region data.
2. Each listed region has at least one real city option.
3. Major countries expose broader province/state coverage.
4. Smaller countries still expose several meaningful regions or city-level areas instead of a blank selector.
5. `Other / Not listed` remains available as a safety valve.

## Product Rules For This Pass

1. Keep the current continent -> country -> state/region -> city structure.
2. Do not remove manual city fallback.
3. Prefer major first-level regions and major cities over exhaustive municipality-level data.
4. For small countries, city-level administrative areas are acceptable when true province-level divisions are too fine-grained or not useful.
5. Preserve the existing capital fallback logic for unsupported countries outside this pass.

## Completion Standard

For Europe, this pass is considered successful when:

1. No selectable European country lands on an empty state/region selector.
2. No selectable European state/region lands on an empty city selector.
3. Large countries remain detailed.
4. Medium and small countries present several practical region/city choices rather than only a capital fallback.
5. Automated checks cover the enriched data shape so regressions are caught early.
