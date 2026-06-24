'use client';

import { useRouter, usePathname } from 'next/navigation';
import { isBusinessSubdomain, getMainDomainUrl } from '../lib/api';

/**
 * LoginPromptModal
 *
 * A polished popup shown when an unauthenticated user attempts an action that
 * requires authentication (write review, add photo, submit business).
 *
 * Props:
 *   isOpen     - boolean  – whether the modal is visible
 *   onClose    - function – called when the user dismisses the modal
 *   action     - string   – short description, e.g. "write a review", "add a photo"
 */
export default function LoginPromptModal({ isOpen, onClose, action = 'continue' }) {
    const router = useRouter();
    const pathname = usePathname();

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        if (isBusinessSubdomain()) {
            window.location.href = `${getMainDomainUrl()}/login?next=${encodeURIComponent(window.location.href)}`;
        } else {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
        }
    };

    const handleSignup = () => {
        onClose();
        if (isBusinessSubdomain()) {
            window.location.href = `${getMainDomainUrl()}/signup?next=${encodeURIComponent(window.location.href)}`;
        } else {
            router.push(`/signup?next=${encodeURIComponent(pathname)}`);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '40px 36px',
                    maxWidth: '420px',
                    width: '100%',
                    boxShadow: '0 24px 64px rgba(15, 23, 42, 0.18)',
                    position: 'relative',
                    textAlign: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        color: '#64748b',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                    ×
                </button>

                {/* Icon */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #2563eb)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>

                {/* Heading */}
                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '10px',
                    lineHeight: '1.3',
                }}>
                    Sign in to {action}
                </h2>

                {/* Description */}
                <p style={{
                    fontSize: '0.96rem',
                    color: '#64748b',
                    lineHeight: '1.6',
                    marginBottom: '28px',
                }}>
                    Join the Nearmee community to share your experiences and help others discover great local businesses.
                </p>

                {/* CTA buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        id="login-prompt-login-btn"
                        onClick={handleLogin}
                        style={{
                            padding: '13px 24px',
                            background: 'var(--color-primary, #2563eb)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s, transform 0.1s',
                            width: '100%',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Log In
                    </button>

                    <button
                        id="login-prompt-signup-btn"
                        onClick={handleSignup}
                        style={{
                            padding: '13px 24px',
                            background: 'transparent',
                            color: 'var(--color-primary, #2563eb)',
                            border: '2px solid var(--color-primary, #2563eb)',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s, transform 0.1s',
                            width: '100%',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Create an Account
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: '6px',
                            marginTop: '4px',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
