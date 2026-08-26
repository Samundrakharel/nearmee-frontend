'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { HexagonOverlay } from '../components/HexagonLoader';
import Logo from '../components/Logo';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next') || '/';

  const getSafeRedirectUrl = (urlStr) => {
    if (!urlStr) return '/';
    // Relative URLs
    if (urlStr.startsWith('/') && !urlStr.startsWith('//')) {
      return urlStr;
    }
    // Absolute URLs
    try {
      const parsed = new URL(urlStr);
      const hostname = parsed.hostname.toLowerCase();
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isNearmeeDomain = hostname === baseDomain || hostname.endsWith(`.${baseDomain}`) || hostname === 'nearmee.local' || hostname.endsWith('.nearmee.local');
      if (isLocalhost || isNearmeeDomain) {
        return urlStr;
      }
    } catch (_) {}
    return '/';
  };

  const nextParam = getSafeRedirectUrl(rawNext);

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      if (nextParam.startsWith('http://') || nextParam.startsWith('https://')) {
        window.location.href = nextParam;
      } else {
        router.push(nextParam);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {loading && <HexagonOverlay label="Signing In…" />}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

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
          {/* Username */}
          <div className="auth-input-group">
            <label htmlFor="login-username">Username</label>
            <div className="auth-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                id="login-username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="auth-options">
            <label className="auth-checkbox">
              <input type="checkbox" id="remember-me" />
              Remember me
            </label>
            <Link href="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            id="login-submit"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Don&apos;t have an account? <Link href={nextParam && nextParam !== '/' ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup"}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '48px 40px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#64748b' }}>Loading...</div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
