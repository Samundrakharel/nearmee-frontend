'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { isLoggedIn, uploadMenuPhoto } from '../lib/api';
import Modal from './Modal';

export default function AddPhotoButton({ businessId, businessSlug, onPhotoAdded }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [captions, setCaptions] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]); // 'idle' | 'uploading' | 'done' | 'error'
    const fileInputRef = useRef(null);
    const router = useRouter();

    const handleOpen = () => {
        if (!isLoggedIn()) {
            router.push('/login');
            return;
        }
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setError('');
        setSuccess(false);
        setSelectedFiles([]);
        setPreviews([]);
        setCaptions([]);
        setUploadProgress([]);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setSelectedFiles(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
        setCaptions(files.map(() => ''));
        setUploadProgress(files.map(() => 'idle'));
    };

    const removeFile = (idx) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter((_, i) => i !== idx));
        setCaptions(prev => prev.filter((_, i) => i !== idx));
        setUploadProgress(prev => prev.filter((_, i) => i !== idx));
    };

    const handleCaptionChange = (idx, value) => {
        setCaptions(prev => {
            const next = [...prev];
            next[idx] = value;
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            setError('Please select at least one photo.');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress(selectedFiles.map(() => 'uploading'));

        // Fire all uploads in parallel per API spec
        const results = await Promise.allSettled(
            selectedFiles.map(async (file, i) => {
                const fd = new FormData();
                fd.append('business', businessId);
                fd.append('photo', file);
                if (captions[i]) fd.append('caption', captions[i]);
                const result = await uploadMenuPhoto(fd);
                setUploadProgress(prev => {
                    const next = [...prev];
                    next[i] = 'done';
                    return next;
                });
                return result;
            })
        );

        const failed = results.filter(r => r.status === 'rejected');

        if (failed.length > 0) {
            setUploadProgress(prev => prev.map((s, i) =>
                results[i].status === 'rejected' ? 'error' : s
            ));
            setError(`${failed.length} photo(s) failed to upload. ${failed[0].reason?.message || ''}`);
        }

        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        if (succeeded > 0) {
            setSuccess(true);
            if (onPhotoAdded) onPhotoAdded();
            if (failed.length === 0) {
                setTimeout(() => handleClose(), 2500);
            }
        }

        setLoading(false);
    };

    const statusIcon = (status) => {
        if (status === 'uploading') return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }}>
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
        );
        if (status === 'done') return <span style={{ color: '#059669', fontSize: '14px' }}>✓</span>;
        if (status === 'error') return <span style={{ color: '#dc2626', fontSize: '14px' }}>✗</span>;
        return null;
    };

    return (
        <>
            <button
                onClick={handleOpen}
                id="btn-add-photo"
                style={{
                    padding: '12px 24px',
                    background: '#fff',
                    color: 'var(--color-primary)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                Add Photo
            </button>

            <Modal isOpen={isModalOpen} onClose={handleClose} title="Add Menu Photos">
                {success && selectedFiles.length > 0 && uploadProgress.every(s => s === 'done') ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📸</div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
                            {selectedFiles.length === 1 ? 'Photo' : `${selectedFiles.length} Photos`} Uploaded!
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            Your photo{selectedFiles.length > 1 ? 's are' : ' is'} pending admin approval.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
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

                        {/* Drop zone / file picker */}
                        <div
                            onClick={() => !loading && fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '10px',
                                padding: '28px',
                                textAlign: 'center',
                                cursor: loading ? 'default' : 'pointer',
                                marginBottom: '16px',
                                background: '#f8fafc',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <p style={{ color: '#475569', fontWeight: '500', margin: '0 0 4px 0' }}>
                                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to select photos'}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Up to 5 photos at once</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            disabled={loading}
                        />

                        {/* Preview list with captions */}
                        {previews.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {previews.map((src, i) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: '10px', alignItems: 'center',
                                        padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px',
                                        background: uploadProgress[i] === 'done' ? '#f0fdf4' : uploadProgress[i] === 'error' ? '#fef2f2' : '#fff',
                                    }}>
                                        <img src={src} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                                        <input
                                            type="text"
                                            placeholder="Caption (optional)"
                                            value={captions[i]}
                                            onChange={e => handleCaptionChange(i, e.target.value)}
                                            maxLength={255}
                                            disabled={loading}
                                            style={{
                                                flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0',
                                                borderRadius: '6px', fontSize: '0.9rem', background: loading ? '#f8fafc' : '#fff',
                                            }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                            {statusIcon(uploadProgress[i])}
                                            {!loading && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', lineHeight: 1 }}
                                                >×</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || selectedFiles.length === 0}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: loading || selectedFiles.length === 0 ? '#94a3b8' : 'var(--color-primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: loading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            {loading
                                ? `Uploading ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}...`
                                : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} Photo${selectedFiles.length !== 1 ? 's' : ''}`
                            }
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </form>
                )}
            </Modal>
        </>
    );
}
