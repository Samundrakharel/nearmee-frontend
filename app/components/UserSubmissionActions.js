'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, isBusinessSubdomain, getMainDomainUrl } from '../lib/api';
import AddPhotoButton from './AddPhotoButton';
import AddReviewButton from './AddReviewButton';
import LoginPromptModal from './LoginPromptModal';

export default function UserSubmissionActions({ business }) {
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const router = useRouter();

    const handleBusinessSubmit = () => {
        if (!isLoggedIn()) {
            setShowLoginPrompt(true);
            return;
        }
        if (isBusinessSubdomain()) {
            window.location.href = `${getMainDomainUrl()}/submit-business`;
        } else {
            router.push('/submit-business');
        }
    };

    return (
        <>
            <LoginPromptModal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                action="submit a business listing"
                redirectPath="/submit-business"
            />

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
        </>
    );
}
