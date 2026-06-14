'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, getMyReviews, getMyMenuPhotos, getMyBusinessSubmissions } from '../lib/api';

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
      router.push('/login');
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
          const res = await getMyReviews();
          setReviews(res.results || []);
        } else if (activeTab === 'photos') {
          const res = await getMyMenuPhotos();
          setPhotos(res.results || []);
        } else if (activeTab === 'submissions') {
          const res = await getMyBusinessSubmissions();
          setSubmissions(res.results || []);
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
                        <div key={review.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '1.1rem' }}>{review.business_name || 'Business'}</strong>
                            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{'⭐'.repeat(review.rating)}</span>
                          </div>
                          {review.title && <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{review.title}</h4>}
                          <p style={{ margin: 0, color: '#475569' }}>{review.content}</p>
                          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>
                            {new Date(review.created_at).toLocaleDateString()}
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {photos.map(photo => (
                        <div key={photo.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ width: '100%', height: '150px', background: '#f1f5f9', position: 'relative' }}>
                            <img src={photo.photo} alt={photo.caption || 'Menu photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          {photo.caption && <div style={{ padding: '12px', fontSize: '0.9rem', color: '#475569' }}>{photo.caption}</div>}
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
                        <div key={sub.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600' }}>{sub.business_name}</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{sub.address}, {sub.city}</p>
                          </div>
                          <span style={{
                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                            background: sub.status === 'APPROVED' ? '#dcfce7' : sub.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                            color: sub.status === 'APPROVED' ? '#166534' : sub.status === 'REJECTED' ? '#991b1b' : '#92400e'
                          }}>
                            {sub.status || 'PENDING'}
                          </span>
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
