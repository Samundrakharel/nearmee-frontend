'use client';

import { useState } from 'react';
import { updateBusiness } from '../lib/api';
import Modal from './Modal';

export default function EditBusinessModal({ isOpen, onClose, business, onSaved }) {
  const [description, setDescription] = useState(business.description || '');
  const [aboutUs, setAboutUs] = useState(business.about || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  const [website, setWebsite] = useState(business.website || '');
  const [address, setAddress] = useState(business.address || '');
  const [priceRange, setPriceRange] = useState(business.priceRange || '');
  const [services, setServices] = useState((business.services || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateBusiness(business.slug, {
        description,
        about_us: aboutUs,
        phone,
        email,
        website,
        address,
        price_range: priceRange,
        services: services.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSaved();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit business info">
      {success ? (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669' }}>Saved!</h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Description</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>About us</label>
            <textarea rows={4} value={aboutUs} onChange={e => setAboutUs(e.target.value)} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Website</label>
            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Price range</label>
            <input type="text" value={priceRange} onChange={e => setPriceRange(e.target.value)} placeholder="e.g. $, $$, $$$" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Services <span style={{ fontWeight: 400, color: '#94a3b8' }}>(comma-separated)</span>
            </label>
            <input type="text" value={services} onChange={e => setServices(e.target.value)} placeholder="Delivery, Takeout, Dine-in" style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', background: loading ? '#94a3b8' : 'var(--color-primary)',
              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem',
            }}
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      )}
    </Modal>
  );
}
