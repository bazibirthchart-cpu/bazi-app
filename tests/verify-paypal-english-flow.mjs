import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../bazi-app-en/', import.meta.url);
const indexHtml = readFileSync(new URL('index.html', root), 'utf8');
const checkoutHtml = readFileSync(new URL('checkout.html', root), 'utf8');
const reportHtml = readFileSync(new URL('report.html', root), 'utf8');
const ordersApi = readFileSync(new URL('functions/api/orders-create.js', root), 'utf8');
const confirmApi = readFileSync(new URL('functions/api/payments-confirm.js', root), 'utf8');
const tokenApi = readFileSync(new URL('functions/api/report-by-token.js', root), 'utf8');
const ordersLib = readFileSync(new URL('functions/_lib/orders.js', root), 'utf8');
const paypalLib = readFileSync(new URL('functions/_lib/paypal.js', root), 'utf8');

assert.equal(existsSync(new URL('checkout.html', root)), true, 'English site should include a checkout page.');
assert.equal(existsSync(new URL('report.html', root)), true, 'English site should include a permanent report page.');
assert.equal(existsSync(new URL('functions/api/orders-create.js', root)), true, 'English site should include order creation API.');
assert.equal(existsSync(new URL('functions/api/payments-confirm.js', root)), true, 'English site should include payment confirmation API.');
assert.equal(existsSync(new URL('functions/api/report-by-token.js', root)), true, 'English site should include report token API.');

assert.match(indexHtml, /fetch\('\/api\/orders-create'/i, 'English submit flow should create backend orders.');
assert.doesNotMatch(indexHtml, /test-unlock\.html/i, 'English site should no longer redirect to the test unlock page.');
assert.match(indexHtml, /loadPaidReportFromToken/i, 'English site should restore paid reports from a token.');
assert.match(indexHtml, /complete payment before opening the full report/i, 'English site should guard premium tabs behind payment.');

assert.match(checkoutHtml, /confirmPayment/i, 'Checkout page should confirm payment.');
assert.match(checkoutHtml, /Try payment again/i, 'Checkout page should support retry within the payment window.');
assert.match(checkoutHtml, /permanent report link/i, 'Checkout page should explain the permanent link.');

assert.match(reportHtml, /index\.html/i, 'Permanent report page should reopen the main report renderer.');

assert.match(ordersApi, /createOrRefreshPendingOrder/i, 'Order API should create or reuse pending orders.');
assert.match(confirmApi, /markOrderPaid/i, 'Confirm API should mark the order as paid.');
assert.match(tokenApi, /getOrderByToken/i, 'Token API should load orders by permanent token.');

assert.match(ordersLib, /createPendingOrder/i, 'Order helper should create pending orders.');
assert.match(ordersLib, /markOrderPaid/i, 'Order helper should mark orders paid.');
assert.match(ordersLib, /getOrderByToken/i, 'Order helper should load by token.');
assert.match(paypalLib, /createPayPalOrder/i, 'PayPal helper should create PayPal orders.');
assert.match(paypalLib, /capturePayPalOrder/i, 'PayPal helper should capture PayPal orders.');

console.log('paypal english flow structure checks passed');
