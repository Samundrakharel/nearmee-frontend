'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { isLoggedIn, submitReview, submitReviewWithPhotos } from '../lib/api';
import Modal from './Modal';
import LoginPromptModal from './LoginPromptModal';

export default function AddReviewButton({ businessId, businessSlug, onReviewAdded }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const photoInputRef = useRef(null);
    const router = useRouter();

    const handleOpen = () => {
        if (!isLoggedIn()) {
            setShowLoginPrompt(true);
            return;
        }
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setError('');
        setFieldErrors({});
        setSuccess(false);
        setRating(5);
        setHoverRating(0);
        setSelectedPhotos([]);
        setPhotoPreviews([]);
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 3);
        setSelectedPhotos(files);
        const previews = files.map(f => URL.createObjectURL(f));
        setPhotoPreviews(previews);
    };

    const removePhoto = (idx) => {
        const newFiles = selectedPhotos.filter((_, i) => i !== idx);
        const newPreviews = photoPreviews.filter((_, i) => i !== idx);
        setSelectedPhotos(newFiles);
        setPhotoPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});

        const formData = new FormData(e.target);
        const title = formData.get('title');
        const content = formData.get('content');
        const visitDate = formData.get('visit_date');
        const isVerified = formData.get('is_verified_visit') === 'on';

        try {
            if (selectedPhotos.length > 0) {
                // Use multipart/form-data when photos are attached
                const fd = new FormData();
                fd.append('business', businessId);
                fd.append('rating', rating);
                if (title) fd.append('title', title);
                fd.append('content', content);
                fd.append('is_verified_visit', isVerified);
                if (visitDate) fd.append('visit_date', visitDate);
                selectedPhotos.forEach((file, i) => {
                    fd.append(`photos[${i}]photo`, file);
                });
                await submitReviewWithPhotos(fd);
            } else {
                // Plain JSON when no photos
                const payload = {
                    business: businessId,
                    rating,
                    content,
                    is_verified_visit: isVerified,
                };
                if (title) payload.title = title;
                if (visitDate) payload.visit_date = visitDate;
                await submitReview(payload);
            }

            setSuccess(true);
            if (onReviewAdded) onReviewAdded();
            window.dispatchEvent(new CustomEvent('nearmee-review-added', { detail: { businessId } }));
            setTimeout(() => handleClose(), 2500);
        } catch (err) {
            setError(err.message || 'Failed to submit review');
            if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field) => ({
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${fieldErrors[field] ? '#fca5a5' : '#d1d5db'}`,
        borderRadius: '8px',
        fontSize: '1rem',
        background: fieldErrors[field] ? '#fff7f7' : '#fff',
        outline: 'none',
        boxSizing: 'border-box',
    });

    const fieldErrStyle = { fontSize: '0.8rem', color: '#dc2626', marginTop: '4px' };

    return (
        <>
            <LoginPromptModal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                action="write a review"
            />
            <button
                onClick={handleOpen}
                id="btn-write-review"
                style={{
                    padding: '12px 24px',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Write a Review
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title="Write a Review"
            >
                {success ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
                            Review Submitted!
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            Thank you! Your review is pending admin approval and will appear shortly.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Global error */}
                        {error && (
                            <div style={{
                                padding: '12px 14px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#dc2626',
                                marginBottom: '16px',
                                fontSize: '0.9rem',
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Non-field errors (e.g. duplicate review) */}
                        {fieldErrors.non_field_errors && (
                            <div style={{
                                padding: '12px 14px',
                                background: '#fffbeb',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                color: '#92400e',
                                marginBottom: '16px',
                                fontSize: '0.9rem',
                            }}>
                                {fieldErrors.non_field_errors}
                            </div>
                        )}

                        {/* Star rating */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
                                Your Rating *
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '2rem',
                                            lineHeight: 1,
                                            padding: '0 2px',
                                            color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
                                            transition: 'color 0.15s, transform 0.1s',
                                            transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span style={{ alignSelf: 'center', marginLeft: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || rating]}
                                </span>
                            </div>
                            {fieldErrors.rating && <p style={fieldErrStyle}>{fieldErrors.rating}</p>}
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
                                Title <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                maxLength={200}
                                placeholder="e.g., Amazing experience!"
                                style={inputStyle('title')}
                            />
                            {fieldErrors.title && <p style={fieldErrStyle}>{fieldErrors.title}</p>}
                        </div>

                        {/* Content */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
                                Your Review *
                            </label>
                            <textarea
                                name="content"
                                required
                                rows={4}
                                placeholder="Share your experience..."
                                style={{ ...inputStyle('content'), resize: 'vertical', fontFamily: 'inherit' }}
                            />
                            {fieldErrors.content && <p style={fieldErrStyle}>{fieldErrors.content}</p>}
                        </div>

                        {/* Photos */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
                                Add Photos <span style={{ fontWeight: 400, color: '#94a3b8' }}>(up to 3)</span>
                            </label>
                            {photoPreviews.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    {photoPreviews.map((src, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                style={{
                                                    position: 'absolute', top: '-6px', right: '-6px',
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    background: '#ef4444', color: '#fff', border: 'none',
                                                    cursor: 'pointer', fontSize: '12px', lineHeight: '20px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedPhotos.length < 3 && (
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1.5px dashed #cbd5e1',
                                        borderRadius: '8px',
                                        background: '#f8fafc',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    Add Photos
                                </button>
                            )}
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                            />
                        </div>

                        {/* Verified visit + date */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                                <input type="checkbox" name="is_verified_visit" id="is_verified_visit" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                <label htmlFor="is_verified_visit" style={{ color: '#374151', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    I physically visited
                                </label>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
                                    Visit Date
                                </label>
                                <input
                                    type="date"
                                    name="visit_date"
                                    style={inputStyle('visit_date')}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: loading ? '#94a3b8' : 'var(--color-primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.2s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                                    </svg>
                                    Submitting...
                                </>
                            ) : 'Submit Review'}
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </form>
                )}
            </Modal>
        </>
    );
}
