'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, getMyReviews, getMyMenuPhotos, getMyBusinessSubmissions, deleteReview, deleteMenuPhoto } from '../lib/api';

export default function AccountPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Data states
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    location: ''
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  
  // Password State
  const [pwdForm, setPwdForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?next=/account');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        location: user.location || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
      setDataLoading(true);
      try {
        if (activeTab === 'reviews') {
          // getMyReviews now always returns an array
          const data = await getMyReviews();
          setReviews(Array.isArray(data) ? data : []);
        } else if (activeTab === 'photos') {
          const data = await getMyMenuPhotos();
          setPhotos(Array.isArray(data) ? data : []);
        } else if (activeTab === 'submissions') {
          const data = await getMyBusinessSubmissions();
          setSubmissions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, isAuthenticated]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: 'info', text: 'Updating profile...' });
    try {
      await updateProfile(profileForm);
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwdMsg({ type: 'info', text: 'Changing password...' });
    try {
      await changePassword(pwdForm.oldPassword, pwdForm.newPassword, pwdForm.confirmPassword);
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete review.');
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      await deleteMenuPhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete photo.');
    }
  };

  const statusBadge = (status) => {
    const map = {
      approved:   { bg: '#dcfce7', color: '#166534', label: 'Approved' },
      rejected:   { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
      pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending Review' },
      needs_info: { bg: '#fff7ed', color: '#9a3412', label: 'Needs Info' },
    };
    const s = map[status?.toLowerCase()] || map.pending;
    return (
      <span style={{
        padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
        background: s.bg, color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading account...</div>;
  }

  if (!isAuthenticated) return null; // Wait for redirect

  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px' }}>
          
          {/* Sidebar */}
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 12px'
                }}>
                  {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{user?.first_name} {user?.last_name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>{user?.email}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['profile', 'reviews', 'photos', 'submissions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      textAlign: 'left', padding: '10px 16px', borderRadius: '8px', border: 'none', background: activeTab === tab ? '#eff6ff' : 'transparent',
                      color: activeTab === tab ? 'var(--color-primary)' : '#475569', fontWeight: activeTab === tab ? '600' : '500', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              
              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Profile Settings</h2>
                  
                  {/* Profile Info Form */}
                  <form onSubmit={handleProfileSubmit} style={{ marginBottom: '40px' }}>
                    {profileMsg.text && (
                      <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', background: profileMsg.type === 'error' ? '#fef2f2' : profileMsg.type === 'success' ? '#ecfdf5' : '#eff6ff', color: profileMsg.type === 'error' ? '#dc2626' : profileMsg.type === 'success' ? '#059669' : '#2563eb' }}>
                        {profileMsg.text}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>First Name</label>
                        <input type="text" value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Name</label>
                        <input type="text" value={profileForm.last_name} onChange={e => setProfileForm({...profileForm, last_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone Number</label>
                      <input type="text" value={profileForm.phone_number} onChange={e => setProfileForm({...profileForm, phone_number: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Location</label>
                      <input type="text" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
                  </form>

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

                  {/* Password Form */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>Change Password</h3>
                  <form onSubmit={handlePasswordSubmit}>
                    {pwdMsg.text && (
                      <div style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', background: pwdMsg.type === 'error' ? '#fef2f2' : pwdMsg.type === 'success' ? '#ecfdf5' : '#eff6ff', color: pwdMsg.type === 'error' ? '#dc2626' : pwdMsg.type === 'success' ? '#059669' : '#2563eb' }}>
                        {pwdMsg.text}
                      </div>
                    )}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Current Password</label>
                      <input type="password" required value={pwdForm.oldPassword} onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>New Password</label>
                      <input type="password" required value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Confirm New Password</label>
                      <input type="password" required value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <button type="submit" style={{ padding: '10px 24px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Update Password</button>
                  </form>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>My Reviews</h2>
                  {dataLoading ? <p>Loading reviews...</p> : reviews.length === 0 ? <p style={{ color: '#64748b' }}>You haven't written any reviews yet.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {reviews.map(review => (
                        <div key={review.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '1.05rem' }}>{review.business_name || 'Business'}</strong>
                              <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} style={{ color: s <= review.rating ? '#f59e0b' : '#d1d5db', fontSize: '1.1rem' }}>★</span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                            >
                              Delete
                            </button>
                          </div>
                          {review.title && <h4 style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '0.95rem' }}>{review.title}</h4>}
                          <p style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>{review.content}</p>
                          {review.photos && review.photos.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                              {review.photos.map(photo => (
                                <img key={photo.id} src={photo.photo} alt={photo.caption || ''}
                                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>
                            <span>{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '600',
                              background: review.status === 'approved' ? '#dcfce7' : '#fef3c7',
                              color: review.status === 'approved' ? '#166534' : '#92400e',
                            }}>
                              {review.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>My Photos</h2>
                  {dataLoading ? <p>Loading photos...</p> : photos.length === 0 ? <p style={{ color: '#64748b' }}>You haven't uploaded any photos yet.</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                      {photos.map(photo => (
                        <div key={photo.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                          <div style={{ width: '100%', height: '140px', position: 'relative', background: '#f1f5f9' }}>
                            <img src={photo.photo} alt={photo.caption || 'Menu photo'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <span style={{
                              position: 'absolute', top: '8px', right: '8px',
                              padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '600',
                              background: photo.status === 'approved' ? '#dcfce7' : '#fef3c7',
                              color: photo.status === 'approved' ? '#166534' : '#92400e',
                            }}>
                              {photo.status === 'approved' ? 'Live' : 'Pending'}
                            </span>
                          </div>
                          <div style={{ padding: '10px 12px' }}>
                            {photo.caption && <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#475569' }}>{photo.caption}</p>}
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              style={{ width: '100%', padding: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>My Business Submissions</h2>
                  {dataLoading ? <p>Loading submissions...</p> : submissions.length === 0 ? <p style={{ color: '#64748b' }}>You haven't submitted any businesses yet.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {submissions.map(sub => (
                        <div key={sub.id} style={{ padding: '18px 20px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>{sub.business_name}</h4>
                            {statusBadge(sub.status)}
                          </div>
                          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                            {sub.address && `${sub.address}, `}{sub.city}{sub.state && `, ${sub.state}`}
                          </p>
                          <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                            Submitted {new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          {(sub.status === 'rejected' || sub.status === 'needs_info') && sub.rejection_reason && (
                            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.88rem', color: '#dc2626' }}>
                              <strong>Admin note:</strong> {sub.rejection_reason}
                            </div>
                          )}
                          {sub.admin_notes && sub.status !== 'rejected' && (
                            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '0.88rem', color: '#92400e' }}>
                              <strong>Note:</strong> {sub.admin_notes}
                            </div>
                          )}
                          {sub.status === 'approved' && sub.approved_business && (
                            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#059669', fontWeight: '500' }}>
                              ✓ Business is now live on the directory
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
