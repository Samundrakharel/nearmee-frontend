'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getAllCategories, isLoggedIn, submitBusiness } from '../lib/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

const DEFAULT_HOURS = DAYS.reduce((acc, d) => {
    acc[d] = { open: '09:00', close: '21:00', closed: false };
    return acc;
}, {});

const STEPS = ['Basic Info', 'Contact', 'Location', 'Hours & Pricing', 'Photos', 'Social'];

export default function SubmitBusinessPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [operatingHours, setOperatingHours] = useState(DEFAULT_HOURS);
    const [logoCover, setLogoCover] = useState({ logo: null, logoPreview: null, cover: null, coverPreview: null });

    const [form, setForm] = useState({
        business_name: '', business_type: '', description: '',
        phone: '', email: '', website: '',
        address: '', city: '', state: '', country: 'United States', zip_code: '',
        lat: '', lng: '',
        price_range: '', services_offered: '',
        facebook_url: '', instagram_url: '', twitter_url: '',
    });

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push('/login');
            return;
        }
        getAllCategories().then(cats => setCategories(cats)).catch(() => {});
    }, [router]);

    const setField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleHoursChange = (day, field, value) => {
        setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
    };

    const handleFileChange = (type, e) => {
        const file = e.target.files[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        if (type === 'logo') setLogoCover(prev => ({ ...prev, logo: file, logoPreview: preview }));
        else setLogoCover(prev => ({ ...prev, cover: file, coverPreview: preview }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setFieldErrors({});

        const fd = new FormData();

        // Required fields
        fd.append('business_name', form.business_name);
        fd.append('business_type', form.business_type);
        fd.append('description', form.description);
        fd.append('phone', form.phone);
        fd.append('email', form.email);
        fd.append('address', form.address);
        fd.append('city', form.city);
        fd.append('state', form.state);
        fd.append('country', form.country || 'United States');

        // Optional fields
        if (form.website) fd.append('website', form.website);
        if (form.zip_code) fd.append('zip_code', form.zip_code);
        if (form.lat) fd.append('lat', form.lat);
        if (form.lng) fd.append('lng', form.lng);
        if (form.price_range) fd.append('price_range', form.price_range);
        if (form.services_offered) fd.append('services_offered', form.services_offered);
        if (form.facebook_url) fd.append('facebook_url', form.facebook_url);
        if (form.instagram_url) fd.append('instagram_url', form.instagram_url);
        if (form.twitter_url) fd.append('twitter_url', form.twitter_url);

        // Category IDs
        selectedCategories.forEach(id => fd.append('category_ids', id));

        // Operating hours as JSON string
        const hours = {};
        DAYS.forEach(d => {
            if (!operatingHours[d].closed) {
                hours[d] = { open: operatingHours[d].open, close: operatingHours[d].close };
            }
        });
        fd.append('operating_hours', JSON.stringify(hours));

        // File uploads
        if (logoCover.logo) fd.append('logo', logoCover.logo);
        if (logoCover.cover) fd.append('cover_photo', logoCover.cover);

        try {
            await submitBusiness(fd);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to submit business');
            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
                // Jump to first step with an error
                const errorFields = Object.keys(err.fieldErrors);
                const stepFields = [
                    ['business_name', 'business_type', 'description'],
                    ['phone', 'email', 'website'],
                    ['address', 'city', 'state', 'country', 'zip_code', 'lat', 'lng'],
                    ['price_range', 'services_offered', 'operating_hours'],
                    ['logo', 'cover_photo'],
                    ['facebook_url', 'instagram_url', 'twitter_url'],
                ];
                for (let i = 0; i < stepFields.length; i++) {
                    if (errorFields.some(f => stepFields[i].includes(f))) {
                        setStep(i);
                        break;
                    }
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // ─── Success Screen ───────────────────────────────────
    if (success) {
        return (
            <>
                <Header />
                <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#f8fafc' }}>
                    <div style={{ textAlign: 'center', maxWidth: '500px', background: '#fff', padding: '48px 40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                            Business Submitted!
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
                            Thank you! Our team will review your submission and it'll go live once approved. You can track its status in your <strong>Account → Submissions</strong> tab.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => router.push('/account')}
                                style={{ padding: '12px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                            >
                                View My Submissions
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                style={{ padding: '12px 24px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // ─── Input helpers ─────────────────────────────────────
    const inputStyle = (field) => ({
        width: '100%', padding: '11px 13px', border: `1px solid ${fieldErrors[field] ? '#fca5a5' : '#d1d5db'}`,
        borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
        background: fieldErrors[field] ? '#fff7f7' : '#fff',
    });

    const FErr = ({ field }) => fieldErrors[field]
        ? <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', marginBottom: 0 }}>{fieldErrors[field]}</p>
        : null;

    const Label = ({ children, required }) => (
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '0.92rem' }}>
            {children} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
    );

    const Field = ({ children, style }) => (
        <div style={{ marginBottom: '18px', ...style }}>{children}</div>
    );

    // ─── Step Content ──────────────────────────────────────
    const renderStep = () => {
        switch (step) {
            // ── Step 0: Basic Info
            case 0: return (
                <div>
                    <Field>
                        <Label required>Business Name</Label>
                        <input type="text" value={form.business_name} onChange={e => setField('business_name', e.target.value)}
                            placeholder="e.g., The Green Spoon" maxLength={255} style={inputStyle('business_name')} />
                        <FErr field="business_name" />
                    </Field>

                    <Field>
                        <Label required>Business Type</Label>
                        <select value={form.business_type} onChange={e => setField('business_type', e.target.value)} style={inputStyle('business_type')}>
                            <option value="">Select a type</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="cafe">Cafe</option>
                            <option value="bar">Bar</option>
                            <option value="service">Service Business</option>
                            <option value="retail">Retail Store</option>
                            <option value="other">Other</option>
                        </select>
                        <FErr field="business_type" />
                    </Field>

                    <Field>
                        <Label required>Description</Label>
                        <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                            rows={5} placeholder="Tell us about your business, what makes it special..."
                            style={{ ...inputStyle('description'), resize: 'vertical', fontFamily: 'inherit' }} />
                        <FErr field="description" />
                    </Field>

                    {categories.length > 0 && (
                        <Field>
                            <Label>Categories</Label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => toggleCategory(cat.id)}
                                        style={{
                                            padding: '6px 14px',
                                            border: `1.5px solid ${selectedCategories.includes(cat.id) ? 'var(--color-primary)' : '#d1d5db'}`,
                                            borderRadius: '20px',
                                            background: selectedCategories.includes(cat.id) ? 'var(--color-primary)' : '#fff',
                                            color: selectedCategories.includes(cat.id) ? '#fff' : '#374151',
                                            fontSize: '0.88rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '6px' }}>Select all that apply</p>
                        </Field>
                    )}
                </div>
            );

            // ── Step 1: Contact
            case 1: return (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Field>
                            <Label required>Phone</Label>
                            <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                                placeholder="+1-555-123-4567" maxLength={30} style={inputStyle('phone')} />
                            <FErr field="phone" />
                        </Field>
                        <Field>
                            <Label required>Email</Label>
                            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                                placeholder="hello@business.com" style={inputStyle('email')} />
                            <FErr field="email" />
                        </Field>
                    </div>
                    <Field>
                        <Label>Website</Label>
                        <input type="url" value={form.website} onChange={e => setField('website', e.target.value)}
                            placeholder="https://yourbusiness.com" style={inputStyle('website')} />
                        <FErr field="website" />
                    </Field>
                </div>
            );

            // ── Step 2: Location
            case 2: return (
                <div>
                    <Field>
                        <Label required>Street Address</Label>
                        <input type="text" value={form.address} onChange={e => setField('address', e.target.value)}
                            placeholder="123 Main Street" maxLength={500} style={inputStyle('address')} />
                        <FErr field="address" />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Field>
                            <Label required>City</Label>
                            <input type="text" value={form.city} onChange={e => setField('city', e.target.value)}
                                placeholder="Austin" maxLength={100} style={inputStyle('city')} />
                            <FErr field="city" />
                        </Field>
                        <Field>
                            <Label required>State / Province</Label>
                            <input type="text" value={form.state} onChange={e => setField('state', e.target.value)}
                                placeholder="Texas" maxLength={100} style={inputStyle('state')} />
                            <FErr field="state" />
                        </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <Field>
                            <Label required>Country</Label>
                            <input type="text" value={form.country} onChange={e => setField('country', e.target.value)}
                                placeholder="United States" maxLength={100} style={inputStyle('country')} />
                            <FErr field="country" />
                        </Field>
                        <Field>
                            <Label>ZIP / Postal Code</Label>
                            <input type="text" value={form.zip_code} onChange={e => setField('zip_code', e.target.value)}
                                placeholder="78701" maxLength={20} style={inputStyle('zip_code')} />
                            <FErr field="zip_code" />
                        </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Field>
                            <Label>Latitude <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional GPS)</span></Label>
                            <input type="number" step="any" value={form.lat} onChange={e => setField('lat', e.target.value)}
                                placeholder="30.267153" style={inputStyle('lat')} />
                            <FErr field="lat" />
                        </Field>
                        <Field>
                            <Label>Longitude <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional GPS)</span></Label>
                            <input type="number" step="any" value={form.lng} onChange={e => setField('lng', e.target.value)}
                                placeholder="-97.743057" style={inputStyle('lng')} />
                            <FErr field="lng" />
                        </Field>
                    </div>
                </div>
            );

            // ── Step 3: Hours & Pricing
            case 3: return (
                <div>
                    <Field>
                        <Label>Price Range</Label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['$', '$$', '$$$', '$$$$'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setField('price_range', form.price_range === p ? '' : p)}
                                    style={{
                                        padding: '8px 18px',
                                        border: `1.5px solid ${form.price_range === p ? 'var(--color-primary)' : '#d1d5db'}`,
                                        borderRadius: '8px',
                                        background: form.price_range === p ? 'var(--color-primary)' : '#fff',
                                        color: form.price_range === p ? '#fff' : '#374151',
                                        fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field>
                        <Label>Services Offered</Label>
                        <textarea value={form.services_offered} onChange={e => setField('services_offered', e.target.value)}
                            rows={4} placeholder={"Dine-in\nTakeaway\nDelivery\nCatering"}
                            style={{ ...inputStyle('services_offered'), resize: 'vertical', fontFamily: 'inherit' }} />
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>One service per line</p>
                    </Field>

                    <div>
                        <Label>Operating Hours</Label>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                            {DAYS.map((day, i) => (
                                <div key={day} style={{
                                    display: 'grid', gridTemplateColumns: '100px 1fr',
                                    alignItems: 'center', padding: '12px 16px',
                                    borderBottom: i < DAYS.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    background: operatingHours[day].closed ? '#f8fafc' : '#fff',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={!operatingHours[day].closed}
                                            onChange={e => handleHoursChange(day, 'closed', !e.target.checked)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <span style={{
                                            fontWeight: '600', fontSize: '0.88rem',
                                            color: operatingHours[day].closed ? '#94a3b8' : '#374151'
                                        }}>
                                            {DAY_LABELS[day].slice(0, 3)}
                                        </span>
                                    </div>

                                    {operatingHours[day].closed ? (
                                        <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Closed</span>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="time"
                                                value={operatingHours[day].open}
                                                onChange={e => handleHoursChange(day, 'open', e.target.value)}
                                                style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                                            />
                                            <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>to</span>
                                            <input
                                                type="time"
                                                value={operatingHours[day].close}
                                                onChange={e => handleHoursChange(day, 'close', e.target.value)}
                                                style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

            // ── Step 4: Photos
            case 4: return (
                <div>
                    <Field>
                        <Label>Business Logo</Label>
                        {logoCover.logoPreview && (
                            <div style={{ marginBottom: '12px' }}>
                                <img src={logoCover.logoPreview} alt="Logo preview"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                            </div>
                        )}
                        <label style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '9px 18px', border: '1.5px dashed #cbd5e1', borderRadius: '8px',
                            cursor: 'pointer', background: '#f8fafc', color: '#475569', fontSize: '0.9rem',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            {logoCover.logo ? logoCover.logo.name : 'Choose Logo'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange('logo', e)} />
                        </label>
                        <FErr field="logo" />
                    </Field>

                    <Field>
                        <Label>Cover Photo</Label>
                        {logoCover.coverPreview && (
                            <div style={{ marginBottom: '12px' }}>
                                <img src={logoCover.coverPreview} alt="Cover preview"
                                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                            </div>
                        )}
                        <label style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '9px 18px', border: '1.5px dashed #cbd5e1', borderRadius: '8px',
                            cursor: 'pointer', background: '#f8fafc', color: '#475569', fontSize: '0.9rem',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            {logoCover.cover ? logoCover.cover.name : 'Choose Cover Photo'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange('cover', e)} />
                        </label>
                        <FErr field="cover_photo" />
                    </Field>
                </div>
            );

            // ── Step 5: Social
            case 5: return (
                <div>
                    <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
                        All social media links are optional but help customers find you.
                    </p>
                    <Field>
                        <Label>Facebook URL</Label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                            <span style={{ padding: '11px 12px', background: '#f1f5f9', border: '1px solid #d1d5db', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#94a3b8', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                                facebook.com/
                            </span>
                            <input type="url" value={form.facebook_url} onChange={e => setField('facebook_url', e.target.value)}
                                placeholder="https://facebook.com/yourbusiness"
                                style={{ ...inputStyle('facebook_url'), borderRadius: '0 8px 8px 0' }} />
                        </div>
                        <FErr field="facebook_url" />
                    </Field>
                    <Field>
                        <Label>Instagram URL</Label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ padding: '11px 12px', background: '#f1f5f9', border: '1px solid #d1d5db', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#94a3b8', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                                instagram.com/
                            </span>
                            <input type="url" value={form.instagram_url} onChange={e => setField('instagram_url', e.target.value)}
                                placeholder="https://instagram.com/yourbusiness"
                                style={{ ...inputStyle('instagram_url'), borderRadius: '0 8px 8px 0' }} />
                        </div>
                        <FErr field="instagram_url" />
                    </Field>
                    <Field>
                        <Label>Twitter / X URL</Label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ padding: '11px 12px', background: '#f1f5f9', border: '1px solid #d1d5db', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#94a3b8', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                                x.com/
                            </span>
                            <input type="url" value={form.twitter_url} onChange={e => setField('twitter_url', e.target.value)}
                                placeholder="https://x.com/yourbusiness"
                                style={{ ...inputStyle('twitter_url'), borderRadius: '0 8px 8px 0' }} />
                        </div>
                        <FErr field="twitter_url" />
                    </Field>
                </div>
            );

            default: return null;
        }
    };

    const canProceed = () => {
        if (step === 0) return form.business_name.trim() && form.business_type && form.description.trim();
        if (step === 1) return form.phone.trim() && form.email.trim();
        if (step === 2) return form.address.trim() && form.city.trim() && form.state.trim() && form.country.trim();
        return true;
    };

    const isLastStep = step === STEPS.length - 1;

    return (
        <>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px', background: '#f8fafc' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                    {/* Page header */}
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                            Submit Your Business
                        </h1>
                        <p style={{ color: '#64748b', margin: 0 }}>
                            Add your business to our directory. Our team will review and approve it.
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', gap: '0', marginBottom: '32px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        {STEPS.map((s, i) => (
                            <div
                                key={s}
                                onClick={() => i < step && setStep(i)}
                                style={{
                                    flex: 1, padding: '12px 4px', textAlign: 'center', fontSize: '0.78rem', fontWeight: '600',
                                    cursor: i < step ? 'pointer' : 'default',
                                    background: i === step ? 'var(--color-primary)' : i < step ? '#eff6ff' : '#fff',
                                    color: i === step ? '#fff' : i < step ? 'var(--color-primary)' : '#94a3b8',
                                    borderRight: i < STEPS.length - 1 ? '1px solid #e2e8f0' : 'none',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                }}
                            >
                                {i < step ? '✓ ' : `${i + 1}. `}{s}
                            </div>
                        ))}
                    </div>

                    {/* Form card */}
                    <div style={{ background: '#fff', borderRadius: '14px', padding: '36px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            {STEPS[step]}
                        </h2>

                        {/* Global error */}
                        {error && (
                            <div style={{
                                padding: '13px 16px', background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: '8px', color: '#dc2626', marginBottom: '24px', fontSize: '0.9rem',
                            }}>
                                {error}
                            </div>
                        )}

                        {renderStep()}

                        {/* Navigation buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <button
                                onClick={() => setStep(s => s - 1)}
                                disabled={step === 0}
                                style={{
                                    padding: '11px 24px', background: '#fff', color: '#374151',
                                    border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600',
                                    cursor: step === 0 ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                                    opacity: step === 0 ? 0.4 : 1,
                                }}
                            >
                                ← Back
                            </button>

                            {isLastStep ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    style={{
                                        padding: '11px 32px', background: loading ? '#94a3b8' : 'var(--color-primary)',
                                        color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700',
                                        cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                >
                                    {loading ? 'Submitting...' : '🚀 Submit Business'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={!canProceed()}
                                    style={{
                                        padding: '11px 28px', background: canProceed() ? 'var(--color-primary)' : '#94a3b8',
                                        color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
                                        cursor: canProceed() ? 'pointer' : 'not-allowed', fontSize: '0.95rem',
                                    }}
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                        {STEPS.map((_, i) => (
                            <div key={i} style={{
                                width: i === step ? '24px' : '8px', height: '8px', borderRadius: '4px',
                                background: i <= step ? 'var(--color-primary)' : '#cbd5e1',
                                transition: 'all 0.3s',
                            }} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
