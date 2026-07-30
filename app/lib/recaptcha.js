'use client';

/**
 * Google reCAPTCHA v3 (invisible, score-based) helper.
 *
 * Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY to enable it. If it isn't set,
 * getRecaptchaToken() resolves to null so forms keep working (unprotected)
 * during local development.
 */

let scriptPromise = null;

function loadScript(siteKey) {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Resolves to a reCAPTCHA token for the given action (e.g. "signup",
 * "contact"), or null if reCAPTCHA isn't configured for this deployment.
 */
export async function getRecaptchaToken(action) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === 'undefined') return null;

  await loadScript(siteKey);

  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
}
