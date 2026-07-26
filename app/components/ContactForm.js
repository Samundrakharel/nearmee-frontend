'use client';

import { useState } from 'react';

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
    else if (form.message.trim().length < 20) next.message = 'A little more detail would help us answer properly.';
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
      <h2 className="contact-form-title">Send us a message</h2>
      <p className="contact-form-sub">Fields marked with an asterisk are required.</p>

      {status === 'sent' && (
        <div className="contact-alert success" role="status">
          Thanks — your message is on its way. We will reply to the address you gave us.
        </div>
      )}

      {status === 'failed' && (
        <div className="contact-alert error" role="alert">
          {failureMessage} You can also email us directly at{' '}
          <a href={`mailto:${fallbackEmail}`} style={{ color: 'inherit', fontWeight: 600 }}>{fallbackEmail}</a>.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="contact-form-row">
          <div className="contact-field">
            <label htmlFor="contact-name">Your name <span className="req">*</span></label>
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
            {errors.name && <p className="contact-error">{errors.name}</p>}
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">Email <span className="req">*</span></label>
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
            {errors.email && <p className="contact-error">{errors.email}</p>}
          </div>
        </div>

        <div className="contact-field">
          <label htmlFor="contact-subject">What is this about?</label>
          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={e => setField('subject', e.target.value)}
            className="contact-input"
          >
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className="contact-field">
          <label htmlFor="contact-message">Message <span className="req">*</span></label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            value={form.message}
            onChange={e => setField('message', e.target.value)}
            placeholder="Tell us what you need. If it is about a specific business, a link or the business name helps."
            maxLength={4000}
            className={`contact-input${errors.message ? ' invalid' : ''}`}
            aria-invalid={errors.message ? 'true' : undefined}
          />
          {errors.message
            ? <p className="contact-error">{errors.message}</p>
            : <p className="contact-hint">{form.message.length}/4000</p>}
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
          {sending ? 'Sending…' : 'Send message'}
        </button>

        <p className="contact-privacy">
          We use your details only to answer you. Nothing gets passed on to anyone else.
        </p>
      </form>
    </div>
  );
}
