import { NextResponse } from 'next/server';

/**
 * Receives submissions from the contact form on /contact.
 *
 * Validation and spam filtering happen here so the rules cannot be bypassed by
 * skipping the client-side form. Delivery is deliberately pluggable:
 *
 *   - Set CONTACT_WEBHOOK_URL to forward each message as JSON (Slack incoming
 *     webhook, Zapier/Make catch hook, an internal endpoint — anything that
 *     accepts a POST). This is the quickest way to start actually receiving mail.
 *   - Or replace deliver() below with an SMTP send / a Django API call once
 *     there is an email backend to talk to.
 *
 * Until one of those is in place the message is logged server-side and the
 * request fails with 503, so the form shows its "email us directly" fallback
 * rather than telling a visitor their message was sent when it went nowhere.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = {
  name: 120,
  email: 254,
  subject: 120,
  message: 4000,
};

function validate(payload) {
  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim();
  const subject = (payload.subject || 'General enquiry').trim();
  const message = (payload.message || '').trim();

  if (!name) return { error: 'Please tell us your name.' };
  if (!email) return { error: 'An email address is required so we can reply.' };
  if (!EMAIL_RE.test(email)) return { error: 'That email address does not look valid.' };
  if (message.length < 20) return { error: 'Please write a little more so we can help.' };

  if (name.length > LIMITS.name || email.length > LIMITS.email
    || subject.length > LIMITS.subject || message.length > LIMITS.message) {
    return { error: 'One of the fields is longer than we can accept.' };
  }

  return { data: { name, email, subject, message } };
}

async function deliver(message) {
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (!webhook) {
    console.warn(
      '[contact] CONTACT_WEBHOOK_URL is not set — message logged only, not delivered:',
      message
    );
    return false;
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`Webhook responded ${res.status}`);
  }

  return true;
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  // Honeypot: a real visitor never sees this field, so anything in it is a bot.
  // Answer 200 so the bot has no signal that it was rejected.
  if ((payload.website || '').trim()) {
    return NextResponse.json({ delivered: true });
  }

  const { error, data } = validate(payload);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const forwardedFor = request.headers.get('x-forwarded-for');

  try {
    const delivered = await deliver({
      ...data,
      receivedAt: new Date().toISOString(),
      ip: forwardedFor ? forwardedFor.split(',')[0].trim() : null,
      userAgent: request.headers.get('user-agent') || null,
    });

    if (!delivered) {
      return NextResponse.json(
        { error: 'We could not send your message just now.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ delivered: true });
  } catch (err) {
    console.error('[contact] delivery failed:', err);
    return NextResponse.json(
      { error: 'We could not send your message just now.' },
      { status: 502 }
    );
  }
}
