'use client';

import { useState } from 'react';
import { getRecaptchaToken } from '../lib/recaptcha';

const SUBJECTS = [
  'General enquiry',
  'List my business',
  'Correct or remove a listing',
  'Report a problem with the site',
  'Feedback or suggestion',
  'Partnership',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY = { name: '', email: '', subject: SUBJECTS[0], message: '' };

export default function ContactForm({ fallbackEmail = 'hello@nearmee.net' }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [failureMessage, setFailureMessage] = useState('');

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear the error as soon as the visitor starts fixing the field.
    setErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!form.email.trim()) next.email = 'We need an email address to reply to.';
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'That does not look like a valid email address.';
    if (!form.message.trim()) next.message = 'Please write your message.';
    else if (form.message.trim().length < 20) next.message = 'A little more detail would help us answer properly (at least 20 characters).';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    setFailureMessage('');

    try {
      const recaptchaToken = await getRecaptchaToken('contact').catch(() => null);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
          // Honeypot — left empty by humans, filled in by naive bots.
          website: e.target.website?.value || '',
          recaptchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Your message could not be sent.');
      }

      setForm(EMPTY);
      setStatus('sent');
    } catch (err) {
      setFailureMessage(err.message || 'Your message could not be sent.');
      setStatus('failed');
    }
  };

  const sending = status === 'sending';

  return (
    <div className="contact-form-card">
      <h2 className="contact-form-title">Send Us a Message</h2>
      <p className="contact-form-sub">Have a question or request? Fill in the details below and we will get back to you.</p>

      {status === 'sent' && (
        <div className="contact-alert success" role="status">
          <svg className="contact-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <strong>Message successfully sent!</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
              Thank you for reaching out. Our team has received your inquiry and will reply to your email soon.
            </p>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="contact-alert error" role="alert">
          <svg className="contact-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Unable to send message:</strong> {failureMessage} You can also email us directly at{' '}
            <a href={`mailto:${fallbackEmail}`} style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>{fallbackEmail}</a>.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="contact-form-row">
          <div className="contact-field">
            <label htmlFor="contact-name">
              <span>Your Name <span className="req">*</span></span>
            </label>
            <div className="contact-input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Jane Sharma"
                maxLength={120}
                autoComplete="name"
                className={`contact-input${errors.name ? ' invalid' : ''}`}
                aria-invalid={errors.name ? 'true' : undefined}
              />
            </div>
            {errors.name && <p className="contact-error">{errors.name}</p>}
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">
              <span>Email Address <span className="req">*</span></span>
            </label>
            <div className="contact-input-wrapper">
              <span className="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="you@example.com"
                maxLength={254}
                autoComplete="email"
                className={`contact-input${errors.email ? ' invalid' : ''}`}
                aria-invalid={errors.email ? 'true' : undefined}
              />
            </div>
            {errors.email && <p className="contact-error">{errors.email}</p>}
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor="contact-subject">
            <span>What is this regarding?</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={e => setField('subject', e.target.value)}
            className="contact-input"
            style={{ cursor: 'pointer', background: '#fff' }}
          >
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className="contact-field">
          <label htmlFor="contact-message">
            <span>Message <span className="req">*</span></span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={form.message}
            onChange={e => setField('message', e.target.value)}
            placeholder="Write your message here. If it involves a specific business or location, mentioning the name and city is very helpful."
            maxLength={4000}
            className={`contact-input${errors.message ? ' invalid' : ''}`}
            aria-invalid={errors.message ? 'true' : undefined}
          />
          {errors.message
            ? <p className="contact-error">{errors.message}</p>
            : <p className="contact-hint">{form.message.length} / 4000 characters</p>}
        </div>

        {/* Honeypot: hidden from people, tempting to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
        />

        <button type="submit" className="contact-submit" id="btn-contact-submit" disabled={sending}>
          {sending ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <span>Sending message…</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </>
          )}
        </button>

        <p className="contact-privacy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          We use your details only to respond to your inquiry. We never share or sell your data.
        </p>
      </form>
    </div>
  );
}
