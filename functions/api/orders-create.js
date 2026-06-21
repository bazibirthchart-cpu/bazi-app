import { buildCalculation } from '../_lib/bazi.js';
import { badRequest, handleOptions, json, methodNotAllowed, readJson, serverError } from '../_lib/http.js';
import { createOrRefreshPendingOrder, attachPayPalOrder } from '../_lib/orders.js';
import { buildReport } from '../_lib/report.js';
import { buildTestCheckout, createPayPalOrder, isPayPalConfigured } from '../_lib/paypal.js';

function getBaseUrl(request) {
  return new URL(request.url).origin;
}

function buildStoredPayload(payload) {
  const snapshot = payload.formSnapshot || {};
  return {
    name: payload.name,
    gender: payload.gender,
    birthDate: payload.birthDate,
    birthTime: payload.birthTime,
    isDST: Boolean(payload.isDST),
    longitude: Number(payload.longitude),
    locationLabel: payload.locationLabel,
    language: 'en',
    year: snapshot.year || null,
    month: snapshot.month || null,
    day: snapshot.day || null,
    hour: snapshot.hour || null,
    minute: snapshot.minute || null,
    country: snapshot.country || '',
    province: snapshot.province || '',
    city: snapshot.city || '',
    district: snapshot.district || '',
    overseasCountry: snapshot.overseasCountry || '',
    overseasRegion: snapshot.overseasRegion || '',
    overseasCity: snapshot.overseasCity || '',
    manualCity: snapshot.manualCity || ''
  };
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();

  const payload = await readJson(context.request);
  const { existingOrderId } = payload;
  if (!existingOrderId && (!payload.birthDate || !payload.birthTime || typeof payload.longitude !== 'number')) {
    return badRequest('birthDate, birthTime, and longitude are required.');
  }

  try {
    const normalized = existingOrderId
      ? { existingOrderId }
      : (() => {
          const formSnapshot = buildStoredPayload(payload);
          const calculation = buildCalculation(formSnapshot);
          const report = buildReport(calculation, 'en');
          return { formSnapshot, calculation, report };
        })();

    const order = await createOrRefreshPendingOrder(context.env, {
      existingOrderId,
      ...normalized
    });

    const baseUrl = getBaseUrl(context.request);
    const checkoutUrl = new URL('/checkout.html', baseUrl);
    checkoutUrl.searchParams.set('orderId', order.id);

    if (!isPayPalConfigured(context.env)) {
      checkoutUrl.searchParams.set('mode', 'test');
      return json({
        ok: true,
        orderId: order.id,
        paymentMode: 'test',
        checkoutUrl: checkoutUrl.toString(),
        expiresAt: order.paymentWindowExpiresAt
      });
    }

    const returnUrl = new URL('/checkout.html', baseUrl);
    returnUrl.searchParams.set('orderId', order.id);
    returnUrl.searchParams.set('mode', 'paypal-return');

    const cancelUrl = new URL('/checkout.html', baseUrl);
    cancelUrl.searchParams.set('orderId', order.id);
    cancelUrl.searchParams.set('mode', 'paypal-cancel');

    const paypal = await createPayPalOrder(context.env, order, returnUrl.toString(), cancelUrl.toString());
    await attachPayPalOrder(context.env, order.id, paypal.paypalOrderId);
    checkoutUrl.searchParams.set('mode', 'paypal');
    checkoutUrl.searchParams.set('paypalOrderId', paypal.paypalOrderId);
    checkoutUrl.searchParams.set('approvalUrl', paypal.approvalUrl || '');

    return json({
      ok: true,
      orderId: order.id,
      paymentMode: 'paypal',
      checkoutUrl: checkoutUrl.toString(),
      approvalUrl: paypal.approvalUrl,
      expiresAt: order.paymentWindowExpiresAt
    });
  } catch (error) {
    return serverError('Unable to create the payment order.', {
      type: error?.name || 'Error',
      message: error?.message || String(error)
    });
  }
}
