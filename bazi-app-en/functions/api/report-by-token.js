import { handleOptions, json, methodNotAllowed, notFound, serverError } from '../_lib/http.js';
import { getOrderByToken } from '../_lib/orders.js';

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();
  if (context.request.method !== 'GET') return methodNotAllowed();

  try {
    const url = new URL(context.request.url);
    const token = url.searchParams.get('token');
    if (!token) return notFound('Missing report token.');

    const order = await getOrderByToken(context.env, token);
    if (!order || order.status !== 'paid') {
      return notFound('This report link is invalid or no longer available.');
    }

    return json({
      ok: true,
      order: {
        id: order.id,
        status: order.status,
        paidAt: order.paidAt,
        payerEmail: order.paypalPayerEmail || null,
        emailDeliveryStatus: order.emailDeliveryStatus || 'pending'
      },
      formSnapshot: order.formSnapshot,
      calculation: order.calculation,
      report: order.report
    });
  } catch (error) {
    return serverError(error.message || 'Unable to load the report.');
  }
}
