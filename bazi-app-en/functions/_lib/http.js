const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return withCors(new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers
  }));
}

export function text(body, init = {}) {
  return withCors(new Response(body, init));
}

export function binary(body, contentType, filename) {
  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`
  });
  return withCors(new Response(body, { status: 200, headers }));
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function badRequest(message, details = null) {
  return json({ ok: false, error: message, details }, { status: 400 });
}

export function methodNotAllowed() {
  return text('', { status: 405 });
}

export function handleOptions() {
  return text('', { status: 204 });
}
