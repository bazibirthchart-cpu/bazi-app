import { badRequest, handleOptions, json, methodNotAllowed, readJson, serverError } from '../_lib/http.js';
import { getOrderById, isWithinPaymentWindow, markEmailStatus, markOrderFailed, markOrderPaid } from '../_lib/orders.js';
import { sendReportLinkEmail } from '../_lib/email.js';
import { capturePayPalOrder, isPayPalConfigured } from '../_lib/paypal.js';

function getBaseUrl(request) {
  return new URL(request.url).origin;
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'POST') return methodNotAllowed();

  const payload = await readJson(context.request);
  const { orderId, provider = 'test', paypalOrderId, success = false } = payload;
  if (!orderId) return badRequest('orderId is required.');

  try {
    const order = await getOrderById(context.env, orderId);
    if (!order) return badRequest('Order not found.');

    if (order.status === 'paid' && order.reportToken) {
      const existingReportUrl = new URL('/report.html', getBaseUrl(context.request));
      existingReportUrl.searchParams.set('token', order.reportToken);
      return json({
        ok: true,
        status: 'paid',
        reportUrl: existingReportUrl.toString(),
        emailStatus: order.emailDeliveryStatus || 'pending',
        payerEmail: order.paypalPayerEmail || null
      });
    }

    if (!isWithinPaymentWindow(order)) {
      return badRequest('This payment window has expired. Please start again.');
    }

    let payerEmail = null;
    let finalPayPalOrderId = paypalOrderId || order.paypalOrderId || null;

    if (provider === 'paypal') {
      if (!isPayPalConfigured(context.env)) {
        return serverError('PayPal is not configured on this environment yet.');
      }
      if (!finalPayPalOrderId) {
        return badRequest('paypalOrderId is required for PayPal confirmation.');
      }
      const capture = await capturePayPalOrder(context.env, finalPayPalOrderId);
      payerEmail = capture.payerEmail;
      if (!String(capture.status || '').toUpperCase().includes('COMPLETED')) {
        await markOrderFailed(context.env, order.id, `paypal_status_${capture.status || 'unknown'}`);
        return badRequest('Payment was not completed yet.');
      }
    } else {
      if (!success) {
        return badRequest('Test confirmation requires success=true.');
      }
      payerEmail = null;
    }

    const paidOrder = await markOrderPaid(context.env, {
      id: order.id,
      paypalOrderId: finalPayPalOrderId,
      payerEmail
    });

    const reportUrl = new URL('/report.html', getBaseUrl(context.request));
    reportUrl.searchParams.set('token', paidOrder.reportToken);

    const emailResult = await sendReportLinkEmail(context.env, {
      to: paidOrder.paypalPayerEmail,
      reportUrl: reportUrl.toString(),
      name: paidOrder.formSnapshot?.name || '',
      orderId: paidOrder.id
    });
    await markEmailStatus(context.env, paidOrder.id, emailResult.status, emailResult.reason || null);

    return json({
      ok: true,
      status: 'paid',
      orderId: paidOrder.id,
      reportUrl: reportUrl.toString(),
      emailStatus: emailResult.status,
      emailReason: emailResult.reason || null,
      payerEmail: paidOrder.paypalPayerEmail || null
    });
  } catch (error) {
    return serverError(error.message || 'Unable to confirm payment.');
  }
}
