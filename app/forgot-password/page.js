'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '../lib/api';
import { HexagonOverlay } from '../components/HexagonLoader';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {loading && <HexagonOverlay label="Sending Request…" />}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {success ? (
          <div style={{
            background: '#ecfdf5',
            color: '#059669',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            textAlign: 'center',
            marginBottom: '24px',
            border: '1px solid #a7f3d0',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>If an account exists with that email, you'll receive a reset link shortly.</p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: '16px', fontWeight: 600, color: 'var(--color-primary)' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '18px',
                border: '1px solid #fecaca',
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label htmlFor="reset-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
                  </svg>
                  <input
                    type="email"
                    id="reset-email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Footer */}
            <div className="auth-footer">
              Remember your password? <Link href="/login">Sign In</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
