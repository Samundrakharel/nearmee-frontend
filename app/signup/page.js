'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../lib/api';

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const errorRef = useRef(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+977');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side per-field validation
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required.';
    if (!firstName.trim()) errors.first_name = 'First name is required.';
    if (!lastName.trim()) errors.last_name = 'Last name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    if (!confirmPassword) errors.confirm_password = 'Please confirm your password.';
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }
    if (!phoneNumber.trim()) {
      errors.phone_number = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      errors.phone_number = 'Phone number must be exactly 10 digits.';
    }
    if (!location.trim()) errors.location = 'Location is required.';
    if (!agreedToTerms) errors.terms = 'You must agree to the Terms of Service.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error field
      setTimeout(() => {
        const firstError = document.querySelector('[data-field-error]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const userData = {
      username: username.trim(),
      email: email.trim(),
      password,
      confirm_password: confirmPassword,
      user_type: role === 'business' ? 'BUSINESS_LISTER' : 'CUSTOMER',
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: `${countryCode}${phoneNumber.trim()}`,
      location: location.trim(),
    };

    setLoading(true);
    try {
      await registerUser(userData);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      if (err.fieldErrors) {
        const apiErrors = { ...err.fieldErrors };
        // Map non-field errors (like public email domain) to the email field
        if (apiErrors._general) {
          apiErrors.email = apiErrors._general;
          delete apiErrors._general;
        }
        setFieldErrors(apiErrors);
      } else {
        setFieldErrors({ email: err.message || 'Registration failed. Please try again.' });
      }
      // Scroll to first error field
      setTimeout(() => {
        const firstError = document.querySelector('[data-field-error]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }) => {
    if (!fieldErrors[field]) return null;
    return (
      <span data-field-error style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
        {fieldErrors[field]}
      </span>
    );
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Account Created!
          </h1>
          <p style={{ color: '#475569', marginBottom: '24px' }}>
            Your account has been created successfully. Redirecting to login...
          </p>
          <Link href="/login" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Link href="/">
            <svg width="130" height="45" viewBox="0 0 130 45" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="32" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="28" fill="#3B82F6" style={{ letterSpacing: '-1px' }}>near</text>
              <circle cx="88" cy="23" r="21" fill="#3B82F6" />
              <text x="72" y="32" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="28" fill="white" style={{ letterSpacing: '-1px' }}>me</text>
            </svg>
          </Link>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join nearmee and discover local businesses</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-toggle-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
            id="role-customer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Customer
          </button>
          <button
            type="button"
            className={`role-toggle-btn ${role === 'business' ? 'active' : ''}`}
            onClick={() => setRole('business')}
            id="role-business"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Business Owner
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="auth-input-group">
            <label htmlFor="signup-username">Username *</label>
            <div className="auth-input-wrapper" style={fieldErrors.username ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" />
              </svg>
              <input type="text" id="signup-username" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <FieldError field="username" />
          </div>

          {/* First Name & Last Name */}
          <div className="auth-input-group">
            <label htmlFor="signup-first-name">First Name *</label>
            <div className="auth-input-wrapper" style={fieldErrors.first_name ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input type="text" id="signup-first-name" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <FieldError field="first_name" />
          </div>

          <div className="auth-input-group">
            <label htmlFor="signup-last-name">Last Name *</label>
            <div className="auth-input-wrapper" style={fieldErrors.last_name ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input type="text" id="signup-last-name" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <FieldError field="last_name" />
          </div>

          {/* Email */}
          <div className="auth-input-group">
            <label htmlFor="signup-email">Email Address *</label>
            <div className="auth-input-wrapper" style={fieldErrors.email ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13L2 4" />
              </svg>
              <input type="email" id="signup-email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <FieldError field="email" />
          </div>

          {/* Phone Number */}
          <div className="auth-input-group">
            <label htmlFor="signup-phone">Phone Number *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', width: '100%' }}>
              <div className="auth-input-wrapper" style={{ padding: '0 12px', position: 'relative', ...(fieldErrors.phone_number ? { borderColor: '#dc2626' } : {}) }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontSize: '0.95rem', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+977">+977 (NP)</option>
                </select>
                <div style={{ pointerEvents: 'none', position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              <div className="auth-input-wrapper" style={fieldErrors.phone_number ? { borderColor: '#dc2626' } : {}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <input
                  type="tel"
                  id="signup-phone"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
                    if (val.length <= 10) setPhoneNumber(val); // Limit to 10 digits
                  }}
                />
              </div>
            </div>
            <FieldError field="phone_number" />
          </div>

          {/* Location */}
          <div className="auth-input-group">
            <label htmlFor="signup-location">Location *</label>
            <div className="auth-input-wrapper" style={fieldErrors.location ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input type="text" id="signup-location" placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <FieldError field="location" />
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <label htmlFor="signup-password">Password *</label>
            <div className="auth-input-wrapper" style={fieldErrors.password ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="signup-password"
                placeholder="Create a password"
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
            <FieldError field="password" />
          </div>

          {/* Confirm Password */}
          <div className="auth-input-group">
            <label htmlFor="signup-confirm-password">Confirm Password *</label>
            <div className="auth-input-wrapper" style={fieldErrors.confirm_password ? { borderColor: '#dc2626' } : {}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="signup-confirm-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
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
            <FieldError field="confirm_password" />
          </div>

          {/* Terms */}
          <label className="auth-terms">
            <input type="checkbox" id="signup-terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
          </label>
          <FieldError field="terms" />

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
            id="signup-submit"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          >
            {loading ? 'Creating Account...' : (role === 'business' ? 'Register Business' : 'Create Account')}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
