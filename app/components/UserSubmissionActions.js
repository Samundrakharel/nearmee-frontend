'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isLoggedIn } from '../lib/api';
import AddPhotoButton from './AddPhotoButton';
import AddReviewButton from './AddReviewButton';
import Modal from './Modal';

export default function UserSubmissionActions({ business }) {
    const [loggedIn, setLoggedIn] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const router = useRouter();

    useState(() => {
        setLoggedIn(isLoggedIn());
    });

    const handleBusinessSubmit = () => {
        if (!isLoggedIn()) {
            setShowLoginPrompt(true);
            setTimeout(() => {
                setShowLoginPrompt(false);
                router.push('/login');
            }, 2000);
            return;
        }

        // Redirect to submit business page or open modal
        router.push('/submit-business');
    };

    return (
        <>
            <div className="user-submission-actions" style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '16px',
            }}>
                <AddReviewButton
                    businessId={business.id}
                    businessSlug={business.slug}
                />

                <AddPhotoButton
                    businessId={business.id}
                    businessSlug={business.slug}
                />

                <button
                    onClick={handleBusinessSubmit}
                    className="btn-submit-business"
                    style={{
                        padding: '12px 24px',
                        background: '#fff',
                        color: 'var(--color-primary)',
                        border: '2px solid var(--color-primary)',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                    }}
                >
                    Submit a Business
                </button>
            </div>

            <Modal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '24px' }}>
                        Please login to submit a new business listing.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                setShowLoginPrompt(false);
                                router.push('/login');
                            }}
                            style={{
                                padding: '12px 24px',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setShowLoginPrompt(false);
                                router.push('/signup');
                            }}
                            style={{
                                padding: '12px 24px',
                                background: '#fff',
                                color: 'var(--color-primary)',
                                border: '2px solid var(--color-primary)',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
