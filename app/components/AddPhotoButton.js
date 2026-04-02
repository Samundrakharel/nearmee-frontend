'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isLoggedIn } from '../lib/api';
import Modal from './Modal';

export default function AddPhotoButton({ businessId, businessSlug, onPhotoAdded }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            setError('Please login to upload a photo');
            setTimeout(() => {
                setIsModalOpen(false);
                router.push('/login');
            }, 1500);
            return;
        }

        const formData = new FormData(e.target);
        const photoData = new FormData();
        photoData.append('business', businessId);
        photoData.append('photo', formData.get('photo'));
        photoData.append('caption', formData.get('caption') || '');

        setLoading(true);
        setError('');

        try {
            const { uploadMenuPhoto } = await import('../lib/api');
            await uploadMenuPhoto(photoData);
            setIsModalOpen(false);
            if (onPhotoAdded) onPhotoAdded();
            alert('Photo uploaded successfully!');
        } catch (err) {
            setError(err.message || 'Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="btn-add-photo"
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
                Add Photo
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setError('');
                }}
                title="Add Photo"
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
                            Select Photo *
                        </label>
                        <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                            Caption (optional)
                        </label>
                        <input
                            type="text"
                            name="caption"
                            placeholder="e.g., Delicious pasta!"
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
                        {loading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
