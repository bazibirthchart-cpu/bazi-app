# English Page QA Test Report

Date: 2026-06-15
Target: `C:\Users\beata\Documents\bazi app\index-en.html`
Scope: automated validation of report rendering, export triggers, chart image export path, and full PDF export pagination

## Test setup

- Runtime: bundled Node.js `v24.14.0`
- Browser automation: Playwright with local Chrome executable
- Page URL: `file:///C:/Users/beata/Documents/bazi%20app/index-en.html`
- Test mode:
  - real DOM and real export logic
  - mocked `html2canvas` and `jspdf` during export verification only
  - mocked content injected into the report to simulate a full generated reading

## Test data used

- Name: `Automated QA`
- Gender: `Female`
- Solar date: `1983-01-20 05:15`
- True solar time: `1983-01-20 05:22`
- Birth location: `Hasselt, Flanders, Belgium, Europe`
- Report body: repeated long-form English text in every chapter block to stress PDF pagination

## What was verified

### 1. Page boot

- `index-en.html` loaded successfully
- page title rendered as `The Elements Palette`
- page heading rendered as `The Elements Palette`

### 2. Export trigger flow

Both export buttons were triggered successfully through the page code:

- `Save Chart Image`
- `Save Full PDF`

Observed export calls:

- image export produced `elements-palette-bazi-chart-*.png`
- PDF export produced `elements-palette-full-report-*.pdf`

### 3. PDF pagination logic

Verified after the latest export rewrite:

- export logic rendered one PDF page per report tab
- expected report sections:
  1. Basic Info
  2. Chart Overview
  3. Career & Wealth
  4. Love & Relationships
  5. Yearly Outlook
  6. Action Guide
- mock `jsPDF` recorded:
  - 6 image insertions
  - 5 explicit `addPage()` calls
  - total output: 6 PDF pages

This confirms the export path no longer uses the previous “single long image then cut vertically” strategy.

## Bugs found

### Fixed

1. PDF page slicing bug
   - Previous behavior: the whole report was captured as one long bitmap and then cut by page height.
   - User-visible issue: cards and paragraphs were split across page boundaries.
   - Fix applied: rewrote PDF export to build 6 separate export surfaces and render each one as its own PDF page.

2. Download trigger instability in embedded/file browser mode
   - Previous behavior: export depended on standard anchor/blob download only.
   - User-visible issue: clicking the buttons could appear to do nothing.
   - Fix applied:
     - added `showSaveFilePicker` path when supported
     - kept blob download fallback
     - added preview fallback when direct download is blocked

### Still present / environmental

3. External CDN dependency blocker in restricted runtime
   - The automated browser session logged 3 resource failures:
     - `lunar-javascript`
     - `html2canvas`
     - `jspdf`
   - Browser log evidence:
     - `Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED`
   - Impact:
     - in a network-restricted environment, the page cannot fully run with real remote libraries
     - fully real end-to-end report generation cannot be reproduced there unless these libraries are bundled locally

## Changes made during this QA cycle

- kept image export targeted at the current `baziCaptureZone`
- kept PDF export targeted at all 6 report pages
- changed PDF assembly to section-by-section rendering instead of long-image slicing

## Verification summary

- Inline script parsing: passed
- English page loads: passed
- Export buttons fire: passed
- Image export path invoked: passed
- PDF export path invoked: passed
- PDF page count logic: passed with 6 pages
- Real remote dependency availability in restricted automation: failed due CDN blocking

## Remaining risk

- Because the page currently depends on CDN-hosted libraries, a network-restricted environment can still block real report generation/export.
- To remove that risk completely, the next hardening step is to vendor these libraries locally into the project and reference local files instead of CDN URLs.
