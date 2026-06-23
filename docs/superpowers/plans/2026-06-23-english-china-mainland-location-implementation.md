# English China Mainland Location Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the English site support China Mainland selection with English province and city labels while keeping existing Chinese internal lookup keys for longitude and chart logic.

**Architecture:** Keep `localChinaData`, longitude maps, and district maps unchanged as the source of truth. Add a display-label mapping layer in the English site so dropdowns show English labels but continue storing Chinese values internally. Extend the English location verification test to cover China Mainland explicitly.

**Tech Stack:** Static HTML/JS, Node-based verification scripts, Cloudflare Pages-compatible frontend logic

---

### Task 1: Add failing verification for English China Mainland labels

**Files:**
- Modify: `C:\Users\beata\Documents\bazi app\tests\verify-english-location-data.mjs`

- [ ] **Step 1: Add assertions for China Mainland province and city label maps**

Add extraction and assertions for the China English label maps so the test fails until the site exposes explicit English display labels for major China entries such as Beijing, Guangdong, Guangzhou, and Shenzhen.

- [ ] **Step 2: Run the verification script and confirm it fails for missing city English labels**

Run the English location verification script directly and confirm the failure points at missing or incomplete China Mainland English mapping coverage.

- [ ] **Step 3: Commit after the RED step is complete**

Stage only the test file after the failing check is confirmed.

### Task 2: Add English display labels for China Mainland in the English site

**Files:**
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\index.html`

- [ ] **Step 1: Add a China city English label map near `chinaProvinceEnglish`**

Create a focused `chinaCityEnglish` mapping for the cities already listed in `localChinaData`. Keep the Chinese names as keys and English labels as values so value storage and downstream location lookup stay unchanged.

- [ ] **Step 2: Update China province/city dropdown population to use English labels in English mode**

Use the existing Chinese values as `value` and swap only the visible `label` for English when the English standalone site is rendering China Mainland in the enhanced continent-country-state-city flow.

- [ ] **Step 3: Keep fallback behavior safe**

If a city label is not mapped yet, fall back to the Chinese string instead of breaking the selector or longitude logic.

### Task 3: Verify the change end to end

**Files:**
- Modify: `C:\Users\beata\Documents\bazi app\tests\verify-english-location-data.mjs`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\index.html`

- [ ] **Step 1: Re-run English location verification**

Run the location verification script again and confirm all checks pass, including the new China Mainland assertions.

- [ ] **Step 2: Re-run broader English site regression checks if available**

Run the PayPal/location verification script as a regression pass so this label-layer change does not disturb the larger English site flow.

- [ ] **Step 3: Stage only the intended files**

Stage:
- `C:\Users\beata\Documents\bazi app\bazi-app-en\index.html`
- `C:\Users\beata\Documents\bazi app\tests\verify-english-location-data.mjs`
- `C:\Users\beata\Documents\bazi app\docs\superpowers\plans\2026-06-23-english-china-mainland-location-implementation.md`

- [ ] **Step 4: Commit with a focused message**

Use a commit message that clearly states the English site gained China Mainland location support with English labels.
