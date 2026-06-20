async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getBaseUrl(env) {
  return env?.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export function isPayPalConfigured(env) {
  return Boolean(env?.PAYPAL_CLIENT_ID && env?.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken(env) {
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${getBaseUrl(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`PayPal auth failed (${response.status}): ${details}`);
  }
  const data = await response.json();
  return data.access_token;
}

export async function createPayPalOrder(env, order, returnUrl, cancelUrl) {
  const accessToken = await getAccessToken(env);
  const response = await fetch(`${getBaseUrl(env)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.id,
        description: 'BaZi Five Elements Reading',
        amount: {
          currency_code: env?.PAYPAL_CURRENCY || 'EUR',
          value: env?.PAYPAL_AMOUNT || '9.99'
        }
      }],
      application_context: {
        brand_name: env?.APP_NAME || 'BaZi Five Elements Reading',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    })
  });
  const data = await readJsonSafe(response);
  if (!response.ok || !data?.id) {
    throw new Error(`PayPal order creation failed (${response.status})`);
  }
  const approveLink = data.links?.find(link => link.rel === 'approve')?.href || null;
  return {
    paypalOrderId: data.id,
    approvalUrl: approveLink,
    raw: data
  };
}

export async function capturePayPalOrder(env, paypalOrderId) {
  const accessToken = await getAccessToken(env);
  const response = await fetch(`${getBaseUrl(env)}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await readJsonSafe(response);
  if (!response.ok) {
    throw new Error(`PayPal capture failed (${response.status})`);
  }
  const payerEmail = data?.payer?.email_address || null;
  const captureStatus = data?.status || 'UNKNOWN';
  return {
    payerEmail,
    status: captureStatus,
    raw: data
  };
}

export function buildTestCheckout(order, baseUrl) {
  const url = new URL('/checkout.html', baseUrl);
  url.searchParams.set('orderId', order.id);
  url.searchParams.set('mode', 'test');
  return url.toString();
}
