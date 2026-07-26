import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Clears the cache for specific paths so admin content edits appear at once.
 *
 * Django calls this from core/signals.py whenever editable content is saved.
 * Without it, changes would only surface when the time-based revalidate window
 * on those fetches expires.
 *
 * Requires REVALIDATE_SECRET to be set and to match what Django sends; if the
 * env var is missing the endpoint refuses every request rather than allowing
 * anonymous cache purges.
 */
export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'Revalidation is not configured.' },
      { status: 503 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  if (payload.secret !== secret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const paths = Array.isArray(payload.paths) ? payload.paths : [];
  // Only site-relative paths — never let a caller reach outside the app.
  const safe = paths.filter(p => typeof p === 'string' && p.startsWith('/'));

  safe.forEach(path => revalidatePath(path));

  return NextResponse.json({ revalidated: safe });
}
