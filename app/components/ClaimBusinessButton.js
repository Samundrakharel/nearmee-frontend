'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { isLoggedIn, claimBusiness, getMyBusinessClaims } from '../lib/api';
import Modal from './Modal';
import LoginPromptModal from './LoginPromptModal';
import EditBusinessModal from './EditBusinessModal';

const pendingClaimKey = (businessId) => `nearmee_pending_claim_${businessId}`;

export default function ClaimBusinessButton({ business }) {
  const router = useRouter();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [myClaimStatus, setMyClaimStatus] = useState(null); // 'pending' | 'approved' | 'rejected' | null

  const [role, setRole] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');

  const isOwner = !!(user && business.ownerId && user.id === business.ownerId);

  useEffect(() => {
    if (!isLoggedIn() || isOwner) return;
    let cancelled = false;
    getMyBusinessClaims()
      .then(claims => {
        if (cancelled) return;
        const mine = claims.find(c => c.business === business.id);
        setMyClaimStatus(mine ? mine.status : null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [business.id, isOwner]);

  // If the user filled out the claim form, then had to sign up/log in
  // before it could be submitted, pick that saved form back up now that
  // they're authenticated and finish submitting it — no need to re-enter
  // anything or click "Claim this business" again.
  useEffect(() => {
    if (!isLoggedIn() || isOwner) return;
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(pendingClaimKey(business.id)) || 'null');
    } catch (_) {
      saved = null;
    }
    if (!saved) return;
    localStorage.removeItem(pendingClaimKey(business.id));

    claimBusiness(business.id, {
      role: saved.role || '',
      contact_phone: saved.contactPhone || '',
      contact_email: saved.contactEmail || '',
      message: saved.message || '',
    })
      .then(() => setMyClaimStatus('pending'))
      .catch(() => {});
  }, [business.id, isOwner, user]);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setError('');
    setSuccess(false);
    setRole('');
    setContactPhone('');
    setContactEmail('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLoggedIn()) {
      try {
        localStorage.setItem(
          pendingClaimKey(business.id),
          JSON.stringify({ role, contactPhone, contactEmail, message })
        );
      } catch (_) {}
      setIsModalOpen(false);
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    try {
      await claimBusiness(business.id, {
        role,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        message,
      });
      setSuccess(true);
      setMyClaimStatus('pending');
    } catch (err) {
      setError(err.message || 'Failed to submit claim request.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (isOwner) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '999px',
            background: '#ecfdf5', color: '#047857', fontSize: '0.85rem', fontWeight: '600',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            You manage this business
          </span>
          <button
            onClick={() => setShowEditModal(true)}
            id="btn-edit-business"
            style={{
              padding: '8px 16px', background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Edit business info
          </button>
        </div>
        <EditBusinessModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          business={business}
          onSaved={() => { setShowEditModal(false); router.refresh(); }}
        />
      </>
    );
  }

  if (business.isClaimed) {
    return null;
  }

  if (myClaimStatus === 'pending') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '999px',
        background: '#fffbeb', color: '#92400e', fontSize: '0.85rem', fontWeight: '600',
      }}>
        Claim pending review
      </span>
    );
  }

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action="claim this business"
      />
      <button
        onClick={handleOpen}
        id="btn-claim-business"
        style={{
          padding: '10px 20px', background: '#fff', color: 'var(--color-primary)',
          border: '1.5px solid var(--color-primary)', borderRadius: '8px', fontWeight: '700',
          cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        Claim this business
      </button>

      <Modal isOpen={isModalOpen} onClose={handleClose} title="Claim this business">
        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
              Claim submitted!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              We'll review your request and email you once it's approved. You'll then be able to edit this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Let us know you're the owner or an authorized representative of <strong>{business.name}</strong>. An admin will review your request before you get edit access.
            </p>

            {error && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Your role *</label>
              <input type="text" required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Owner, Manager" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Contact phone</label>
              <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Best number to reach you" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Contact email</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="Best email to reach you" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
                Anything that helps us verify ownership <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
              </label>
              <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g. your work email domain, a link to your official website or social page" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
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
              {loading ? 'Submitting...' : (isLoggedIn() ? 'Submit claim request' : 'Continue to sign in')}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
