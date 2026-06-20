# PayPal English Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the English standalone site into a backend-owned paid report flow that creates an order, redirects to PayPal-ready checkout, confirms payment, and reopens purchased reports from a permanent token link.

**Architecture:** Keep the English site as a static-first Pages project, but move payment truth and paid-report access into Pages Functions. Store pending and paid orders in a Cloudflare KV namespace, support a PayPal checkout path when credentials exist, and fall back to a controlled internal test-payment path when credentials are still missing so the complete loop remains testable.

**Tech Stack:** Cloudflare Pages Functions, KV-backed order storage, vanilla HTML/JS frontend, existing report builder, PayPal Orders API integration hooks, focused Node verification scripts.

---

## File map

- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\index.html`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\checkout.html`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\report.html`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\orders.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\paypal.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\email.js`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\http.js`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\report.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\orders-create.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\payments-confirm.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\report-by-token.js`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\package.json`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\wrangler.toml`
- Create: `C:\Users\beata\Documents\bazi app\tests\verify-paypal-english-flow.mjs`

## Task 1: Lock the new backend contract in tests

**Files:**
- Create: `C:\Users\beata\Documents\bazi app\tests\verify-paypal-english-flow.mjs`

- [ ] **Step 1: Write the failing test**

Write a source-level verification script that checks:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../bazi-app-en/', import.meta.url);
const indexHtml = readFileSync(new URL('index.html', root), 'utf8');

assert.equal(existsSync(new URL('checkout.html', root)), true);
assert.equal(existsSync(new URL('report.html', root)), true);
assert.equal(existsSync(new URL('functions/api/orders-create.js', root)), true);
assert.equal(existsSync(new URL('functions/api/payments-confirm.js', root)), true);
assert.equal(existsSync(new URL('functions/api/report-by-token.js', root)), true);

assert.match(indexHtml, /\/api\/orders-create/i);
assert.doesNotMatch(indexHtml, /test-unlock\.html/i);
assert.match(indexHtml, /paymentLink|checkoutUrl|orderId/i);

console.log('paypal english flow structure checks passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node tests/verify-paypal-english-flow.mjs
```

Expected: FAIL because the new files and submit flow do not exist yet.

- [ ] **Step 3: Commit the failing test if desired**

```bash
git add tests/verify-paypal-english-flow.mjs
git commit -m "test: add paypal english flow verification"
```

## Task 2: Add KV-backed order helpers and PayPal hooks

**Files:**
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\orders.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\paypal.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\email.js`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\_lib\http.js`

- [ ] **Step 1: Write the failing helper import check**

Extend the verification script so it also checks for helper exports:

```js
const ordersLib = readFileSync(new URL('functions/_lib/orders.js', root), 'utf8');
const paypalLib = readFileSync(new URL('functions/_lib/paypal.js', root), 'utf8');

assert.match(ordersLib, /createPendingOrder/i);
assert.match(ordersLib, /markOrderPaid/i);
assert.match(ordersLib, /getOrderByToken/i);
assert.match(paypalLib, /createPayPalOrder/i);
assert.match(paypalLib, /capturePayPalOrder/i);
```

- [ ] **Step 2: Implement minimal storage and transport helpers**

Create focused helpers for:

```js
// orders.js
// - requireOrdersNamespace(env)
// - createPendingOrder(env, payload)
// - getOrderById(env, id)
// - updateOrder(env, id, updater)
// - markOrderPaid(env, { id, paypalOrderId, payerEmail })
// - getOrderByToken(env, token)
// - isWithinPaymentWindow(order, now)
```

```js
// paypal.js
// - isPayPalConfigured(env)
// - createPayPalOrder(env, order, returnUrl, cancelUrl)
// - capturePayPalOrder(env, paypalOrderId)
// - buildTestCheckout(order, baseUrl)
```

```js
// email.js
// - sendReportLinkEmail(env, { to, reportUrl, name, orderId })
// returns { status: 'sent' | 'skipped' | 'failed', reason?: string }
```

- [ ] **Step 3: Add small HTTP helpers**

Add to `http.js`:

```js
export function serverError(message, details = null) { ... }
export function notFound(message = 'Not found.') { ... }
export function redirect(location, status = 302) { ... }
```

- [ ] **Step 4: Run syntax checks**

Run:

```bash
node --check bazi-app-en/functions/_lib/orders.js
node --check bazi-app-en/functions/_lib/paypal.js
node --check bazi-app-en/functions/_lib/email.js
node --check bazi-app-en/functions/_lib/http.js
```

Expected: PASS

## Task 3: Create backend endpoints for order creation, payment confirmation, and token report loading

**Files:**
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\orders-create.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\payments-confirm.js`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\report-by-token.js`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\functions\api\report.js`

- [ ] **Step 1: Extend the failing test**

Add checks:

```js
const createApi = readFileSync(new URL('functions/api/orders-create.js', root), 'utf8');
const confirmApi = readFileSync(new URL('functions/api/payments-confirm.js', root), 'utf8');
const tokenApi = readFileSync(new URL('functions/api/report-by-token.js', root), 'utf8');

assert.match(createApi, /createPendingOrder/i);
assert.match(confirmApi, /capturePayPalOrder|buildTestCheckout/i);
assert.match(tokenApi, /getOrderByToken/i);
assert.match(tokenApi, /status !== 'paid'|order\.status/i);
```

- [ ] **Step 2: Implement order creation**

`orders-create.js` should:

```js
// validate payload
// build calculation + report snapshot
// create pending order
// build absolute checkout + return URLs
// create PayPal order if configured, otherwise internal test checkout URL
// return { ok, orderId, paymentMode, checkoutUrl, expiresAt }
```

- [ ] **Step 3: Implement payment confirmation**

`payments-confirm.js` should:

```js
// accept orderId + paypal token or test success flag
// reject expired pending orders
// capture PayPal order when configured
// mark order paid and generate token
// attempt email send
// return { ok, status, reportUrl, emailStatus, payerEmail }
```

- [ ] **Step 4: Implement paid report-by-token**

`report-by-token.js` should:

```js
// load paid order by token
// reject unknown / unpaid token
// return { ok, order, calculation, report }
```

- [ ] **Step 5: Keep `/api/report` as a pure generator**

Update `report.js` so it stays useful for non-payment generation but is no longer the payment gate.

- [ ] **Step 6: Run syntax checks**

Run:

```bash
node --check bazi-app-en/functions/api/orders-create.js
node --check bazi-app-en/functions/api/payments-confirm.js
node --check bazi-app-en/functions/api/report-by-token.js
node --check bazi-app-en/functions/api/report.js
```

Expected: PASS

## Task 4: Replace the English-site test unlock redirect with checkout flow

**Files:**
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\index.html`
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\checkout.html`

- [ ] **Step 1: Extend the failing test**

Add checks:

```js
assert.match(indexHtml, /fetch\('\/api\/orders-create'/i);
assert.match(indexHtml, /window\.location\.href = checkoutUrl|location\.assign\(checkoutUrl\)/i);
assert.doesNotMatch(indexHtml, /premiumUnlocked = true;[\s\S]*pendingUnlockReturn/i);
```

- [ ] **Step 2: Remove test unlock assumptions from main submit flow**

Change `executeSubmit` in `index.html` so it:

```js
// builds the form payload
// posts to /api/orders-create
// stores a pending lightweight snapshot if needed for UI continuity
// redirects to returned checkoutUrl
// no longer redirects to test-unlock.html
```

- [ ] **Step 3: Create a dedicated checkout page**

`checkout.html` should support:

```js
// read orderId + mode from query
// if mode === 'paypal', show "redirecting to secure payment"
// if mode === 'test', show test payment buttons
// show the 30-minute payment window reminder
// on cancel, keep the order retryable and offer retry
```

- [ ] **Step 4: Keep refresh / return behavior explicit**

The page must tell the user:

- paid report links are permanent
- unfinished payment windows last 30 minutes
- if email does not arrive, save the permanent link shown after success

- [ ] **Step 5: Run the source-level verification**

Run:

```bash
node tests/verify-paypal-english-flow.mjs
```

Expected: still FAIL until `report.html` is added.

## Task 5: Add permanent paid report reopening page

**Files:**
- Create: `C:\Users\beata\Documents\bazi app\bazi-app-en\report.html`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\index.html`

- [ ] **Step 1: Extend the failing test**

Add checks:

```js
const reportHtml = readFileSync(new URL('report.html', root), 'utf8');
assert.match(reportHtml, /\/api\/report-by-token/i);
assert.match(reportHtml, /copy link|save this link|email/i);
```

- [ ] **Step 2: Build token-based report page**

`report.html` should:

```js
// read token from URL
// fetch /api/report-by-token
// render success header with permanent-link copy area
// render the same report sections from stored payload
// allow image/PDF export only after token report loads
```

- [ ] **Step 3: Ensure paid reopen survives refresh**

Keep all paid data loading server-driven from the token, not session storage.

- [ ] **Step 4: Add success and fallback messages**

Show:

- "Your report link is permanent"
- "We will also send it to your PayPal email when available"
- "If email is missing or delayed, save this link now"

- [ ] **Step 5: Run the verification script**

Run:

```bash
node tests/verify-paypal-english-flow.mjs
```

Expected: PASS

## Task 6: Wire configuration and deployment metadata

**Files:**
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\package.json`
- Modify: `C:\Users\beata\Documents\bazi app\bazi-app-en\wrangler.toml`

- [ ] **Step 1: Update project checks**

Add new syntax-check targets for:

```json
"check": "node --check functions/api/calculate.js && ... && node --check functions/api/orders-create.js && node --check functions/api/payments-confirm.js && node --check functions/api/report-by-token.js"
```

- [ ] **Step 2: Document required bindings**

Add KV placeholder and vars in `wrangler.toml`, for example:

```toml
[[kv_namespaces]]
binding = "PAYMENT_ORDERS"
id = "replace-in-cloudflare"

[vars]
PAYPAL_ENV = "sandbox"
PAYMENT_WINDOW_MINUTES = "30"
APP_NAME = "BaZi Five Elements Reading"
```

- [ ] **Step 3: Run project checks**

Run:

```bash
cd bazi-app-en
npm run check
```

Expected: PASS

## Task 7: Final verification and handoff notes

**Files:**
- Modify if needed: `C:\Users\beata\Documents\bazi app\docs\superpowers\plans\2026-06-20-paypal-english-site-implementation.md`

- [ ] **Step 1: Run all targeted verification**

Run:

```bash
node tests/verify-paypal-english-flow.mjs
node tests/verify-separated-sites.mjs
node tests/verify-english-location-data.mjs
cd bazi-app-en
npm run check
```

Expected: PASS, or note exactly which check still needs follow-up.

- [ ] **Step 2: Manual QA checklist**

Verify in the browser:

1. Submit English form
2. Land on checkout page instead of report page
3. Complete simulated or PayPal payment
4. Receive permanent report URL
5. Refresh `report.html?token=...`
6. Reopen from copied link
7. Export PDF from paid report

- [ ] **Step 3: Commit**

```bash
git add bazi-app-en tests docs/superpowers/plans/2026-06-20-paypal-english-site-implementation.md
git commit -m "feat: add paypal-ready paid report flow for english site"
```

## Self-review

- Spec coverage: this plan covers backend-owned orders, PayPal-ready checkout, 30-minute retry window, permanent report links, email fallback messaging, and English-only scope.
- Placeholder scan: no `TODO` or deferred implementation markers appear in task steps.
- Type consistency: order id, report token, checkout URL, and email status naming are kept consistent across the plan.

Plan complete and saved to `docs/superpowers/plans/2026-06-20-paypal-english-site-implementation.md`. Execution will continue inline in this session.
