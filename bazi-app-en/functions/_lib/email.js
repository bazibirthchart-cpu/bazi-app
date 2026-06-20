export async function sendReportLinkEmail(env, { to, reportUrl, name, orderId }) {
  if (!to) {
    return { status: 'skipped', reason: 'missing_email' };
  }
  if (!env?.RESEND_API_KEY || !env?.EMAIL_FROM) {
    return { status: 'skipped', reason: 'email_provider_not_configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject: 'Your BaZi Five Elements Reading',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Your payment was confirmed. You can reopen your report at any time using the permanent link below:</p>
          <p><a href="${reportUrl}">${reportUrl}</a></p>
          <p>Order reference: ${orderId}</p>
          <p>If the link does not open directly inside an embedded browser, copy it into your main browser.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const details = await response.text();
    return { status: 'failed', reason: details || `email_http_${response.status}` };
  }
  return { status: 'sent' };
}
