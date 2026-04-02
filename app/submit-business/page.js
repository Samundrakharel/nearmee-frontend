'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { isLoggedIn, submitBusiness } from '../../lib/api';

export default function SubmitBusinessPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Check authentication on mount
    useState(() => {
        if (!isLoggedIn()) {
            router.push('/login');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn()) {
            router.push('/login');
            return;
        }

        const formData = new FormData(e.target);
        const businessData = new FormData();

        // Map form fields to API expected fields
        businessData.append('business_name', formData.get('business_name'));
        businessData.append('business_type', formData.get('business_type'));
        businessData.append('description', formData.get('description'));
        businessData.append('address', formData.get('address'));
        businessData.append('phone', formData.get('phone'));
        businessData.append('email', formData.get('email'));
        businessData.append('city', formData.get('city'));
        businessData.append('state', formData.get('state'));
        businessData.append('country', formData.get('country'));

        // Handle file uploads
        const logoFile = formData.get('logo');
        const coverPhotoFile = formData.get('cover_photo');

        if (logoFile && logoFile.size > 0) {
            businessData.append('logo', logoFile);
        }
        if (coverPhotoFile && coverPhotoFile.size > 0) {
            businessData.append('cover_photo', coverPhotoFile);
        }

        setLoading(true);
        setError('');

        try {
            await submitBusiness(businessData);
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit business');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <>
                <Header />
                <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                            Business Submitted!
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                            Thank you for your submission. Our team will review it shortly.
                        </p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px', background: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                            Submit Your Business
                        </h1>
                        <p style={{ color: '#64748b', marginBottom: '32px' }}>
                            Fill out the form below to add your business to our directory
                        </p>

                        {error && (
                            <div style={{
                                padding: '16px',
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#dc2626',
                                marginBottom: '24px',
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                    Basic Information
                                </h3>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        required
                                        placeholder="e.g., My Coffee Shop"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Business Type *
                                    </label>
                                    <select
                                        name="business_type"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    >
                                        <option value="">Select a type</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="cafe">Cafe</option>
                                        <option value="bar">Bar</option>
                                        <option value="shop">Shop</option>
                                        <option value="service">Service</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        rows="4"
                                        placeholder="Tell us about your business..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                    Contact Information
                                </h3>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        placeholder="+1-555-123-4567"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="hello@mycoffee.com"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                    Location
                                </h3>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        placeholder="123 Main Street"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            placeholder="Los Angeles"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            placeholder="CA"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        placeholder="United States"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                                    Photos (Optional)
                                </h3>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Business Logo
                                    </label>
                                    <input
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                        Cover Photo
                                    </label>
                                    <input
                                        type="file"
                                        name="cover_photo"
                                        accept="image/*"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: loading ? '#94a3b8' : 'var(--color-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '1.1rem',
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit Business'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
