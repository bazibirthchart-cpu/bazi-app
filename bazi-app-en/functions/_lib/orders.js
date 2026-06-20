const ORDER_PREFIX = 'order:';
const TOKEN_PREFIX = 'token:';
const devStore = globalThis.__baziOrderStore || (globalThis.__baziOrderStore = new Map());

function randomToken(length = 24) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
}

function nowIso() {
  return new Date().toISOString();
}

function getWindowMinutes(env) {
  const raw = Number(env?.PAYMENT_WINDOW_MINUTES || 30);
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}

function getStore(env) {
  if (env?.PAYMENT_ORDERS) {
    return {
      async get(key) {
        return env.PAYMENT_ORDERS.get(key);
      },
      async put(key, value) {
        return env.PAYMENT_ORDERS.put(key, value);
      }
    };
  }
  return {
    async get(key) {
      return devStore.has(key) ? devStore.get(key) : null;
    },
    async put(key, value) {
      devStore.set(key, value);
    }
  };
}

async function writeOrder(env, order) {
  const store = getStore(env);
  await store.put(`${ORDER_PREFIX}${order.id}`, JSON.stringify(order));
  if (order.reportToken) {
    await store.put(`${TOKEN_PREFIX}${order.reportToken}`, order.id);
  }
  return order;
}

export async function getOrderById(env, id) {
  if (!id) return null;
  const store = getStore(env);
  const raw = await store.get(`${ORDER_PREFIX}${id}`);
  return raw ? JSON.parse(raw) : null;
}

export async function getOrderByToken(env, token) {
  if (!token) return null;
  const store = getStore(env);
  const orderId = await store.get(`${TOKEN_PREFIX}${token}`);
  if (!orderId) return null;
  return getOrderById(env, orderId);
}

export function isWithinPaymentWindow(order, now = new Date()) {
  if (!order?.paymentWindowExpiresAt) return false;
  return new Date(order.paymentWindowExpiresAt).getTime() > now.getTime();
}

export async function createPendingOrder(env, payload) {
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + (getWindowMinutes(env) * 60 * 1000)).toISOString();
  const order = {
    id,
    site: 'bazi-app-en',
    language: 'en',
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
    paidAt: null,
    paymentWindowExpiresAt: expiresAt,
    reportToken: null,
    paypalOrderId: null,
    paypalPayerEmail: null,
    emailDeliveryStatus: 'pending',
    emailDeliveryReason: null,
    formSnapshot: payload.formSnapshot,
    calculation: payload.calculation,
    report: payload.report
  };
  return writeOrder(env, order);
}

export async function updateOrder(env, id, updater) {
  const current = await getOrderById(env, id);
  if (!current) return null;
  const next = typeof updater === 'function'
    ? updater({ ...current })
    : { ...current, ...(updater || {}) };
  next.updatedAt = nowIso();
  return writeOrder(env, next);
}

export async function createOrRefreshPendingOrder(env, payload) {
  if (payload?.existingOrderId) {
    const existing = await getOrderById(env, payload.existingOrderId);
    if (existing && existing.status === 'pending' && isWithinPaymentWindow(existing)) {
      return existing;
    }
  }
  return createPendingOrder(env, payload);
}

export async function attachPayPalOrder(env, id, paypalOrderId) {
  return updateOrder(env, id, order => ({
    ...order,
    paypalOrderId
  }));
}

export async function markOrderPaid(env, { id, paypalOrderId, payerEmail }) {
  return updateOrder(env, id, order => ({
    ...order,
    status: 'paid',
    paidAt: order.paidAt || nowIso(),
    paypalOrderId: paypalOrderId || order.paypalOrderId || null,
    paypalPayerEmail: payerEmail || order.paypalPayerEmail || null,
    reportToken: order.reportToken || randomToken(18)
  }));
}

export async function markOrderFailed(env, id, reason) {
  return updateOrder(env, id, order => ({
    ...order,
    status: 'failed',
    failureReason: reason || 'payment_failed'
  }));
}

export async function markEmailStatus(env, id, status, reason = null) {
  return updateOrder(env, id, order => ({
    ...order,
    emailDeliveryStatus: status,
    emailDeliveryReason: reason
  }));
}
