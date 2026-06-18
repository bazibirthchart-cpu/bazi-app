# Separate Chinese and English Sites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the current mixed-language BaZi app into two fully independent site roots: one Chinese site and one English site.

**Architecture:** Keep the existing root app untouched for safety, then create two new self-contained deployable directories: `bazi-app-ch/` and `bazi-app-en/`. Each directory gets its own `index.html`, `vendor/`, `functions/`, and `wrangler.toml`, so each can become its own Cloudflare Pages project without sharing entry logic.

**Tech Stack:** Static HTML/JS/CSS, Cloudflare Pages Functions, local vendor JS files, GitHub-backed Cloudflare deployment.

---

### Task 1: Add a failing structure test

**Files:**
- Create: `tests/verify-separated-sites.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

assert.equal(existsSync(new URL('../bazi-app-ch/index.html', import.meta.url)), true);
assert.equal(existsSync(new URL('../bazi-app-en/index.html', import.meta.url)), true);

const zh = readFileSync(new URL('../bazi-app-ch/index.html', import.meta.url), 'utf8');
const en = readFileSync(new URL('../bazi-app-en/index.html', import.meta.url), 'utf8');

assert.match(zh, /<html lang="zh-CN">/i);
assert.match(en, /<html lang="en">/i);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/verify-separated-sites.mjs`
Expected: FAIL because the new directories do not exist yet.

- [ ] **Step 3: Commit**

Hold commit until the split is implemented.

### Task 2: Create independent Chinese site root

**Files:**
- Create: `bazi-app-ch/index.html`
- Create: `bazi-app-ch/vendor/*`
- Create: `bazi-app-ch/functions/**/*`
- Create: `bazi-app-ch/package.json`
- Create: `bazi-app-ch/wrangler.toml`

- [ ] **Step 1: Copy the stable Chinese frontend into `bazi-app-ch/index.html`**
- [ ] **Step 2: Copy local vendor assets into `bazi-app-ch/vendor/`**
- [ ] **Step 3: Copy Cloudflare Pages functions into `bazi-app-ch/functions/`**
- [ ] **Step 4: Add local package and wrangler config so the Chinese site can deploy independently**

### Task 3: Create independent English site root

**Files:**
- Create: `bazi-app-en/index.html`
- Create: `bazi-app-en/vendor/*`
- Create: `bazi-app-en/functions/**/*`
- Create: `bazi-app-en/package.json`
- Create: `bazi-app-en/wrangler.toml`

- [ ] **Step 1: Copy the stable English frontend into `bazi-app-en/index.html`**
- [ ] **Step 2: Copy local vendor assets into `bazi-app-en/vendor/`**
- [ ] **Step 3: Copy Cloudflare Pages functions into `bazi-app-en/functions/`**
- [ ] **Step 4: Add local package and wrangler config so the English site can deploy independently**

### Task 4: Remove cross-page ambiguity

**Files:**
- Modify: `bazi-app-ch/index.html`
- Modify: `bazi-app-en/index.html`

- [ ] **Step 1: Make Chinese site default to Chinese only**
- [ ] **Step 2: Make English site default to English only**
- [ ] **Step 3: Replace in-page language switching with explicit cross-site jump placeholders**

### Task 5: Verify the split

**Files:**
- Modify: `tests/verify-separated-sites.mjs`

- [ ] **Step 1: Run `node tests/verify-separated-sites.mjs`**
- [ ] **Step 2: Run `node tests/verify-language-pages.mjs` to ensure root files still retain current behavior**
- [ ] **Step 3: Review directory layout and summarize Cloudflare setup for two separate projects**
