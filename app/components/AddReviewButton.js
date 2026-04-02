'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isLoggedIn } from '../lib/api';
import Modal from './Modal';

export default function AddReviewButton({ businessId, businessSlug, onReviewAdded }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            setError('Please login to submit a review');
            setTimeout(() => {
                setIsModalOpen(false);
                router.push('/login');
            }, 1500);
            return;
        }

        const formData = new FormData(e.target);
        const reviewData = {
            business: businessId,
            rating: parseInt(formData.get('rating')),
            title: formData.get('title'),
            content: formData.get('content'),
            is_verified_visit: formData.get('is_verified_visit') === 'on',
            visit_date: formData.get('visit_date'),
        };

        setLoading(true);
        setError('');

        try {
            const { submitReview } = await import('../lib/api');
            await submitReview(reviewData);
            setIsModalOpen(false);
            if (onReviewAdded) onReviewAdded();
            alert('Review submitted successfully!');
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    if (!isLoggedIn()) {
                        setIsModalOpen(true);
                    } else {
                        setIsModalOpen(true);
                    }
                }}
                className="btn-add-review"
                style={{
                    padding: '12px 24px',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                }}
            >
                Write a Review
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setError('');
                }}
                title="Write a Review"
            >
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            marginBottom: '16px',
                            fontSize: '0.9rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Rating *
                        </label>
                        <select
                            name="rating"
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                            <option value="4">⭐⭐⭐⭐ - Very Good</option>
                            <option value="3">⭐⭐⭐ - Good</option>
                            <option value="2">⭐⭐ - Fair</option>
                            <option value="1">⭐ - Poor</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Review Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="e.g., Amazing experience!"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Your Review *
                        </label>
                        <textarea
                            name="content"
                            required
                            rows="4"
                            placeholder="Share your experience..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" name="is_verified_visit" />
                            <span style={{ color: '#374151' }}>I verified visited this business</span>
                        </label>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Visit Date
                        </label>
                        <input
                            type="date"
                            name="visit_date"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: loading ? '#94a3b8' : 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
