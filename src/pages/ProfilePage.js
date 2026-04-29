import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, login } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    address: {
      line1: user?.address?.line1 || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      country: user?.address?.country || 'India'
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/auth/me', form);
      const token = localStorage.getItem('token');
      login(data.user, token);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, marginBottom: 4
  };

  const stats = [
    { icon: '📦', label: 'Orders', link: '/orders' },
    { icon: '⭐', label: 'Reviews', link: '#' },
    { icon: '❤️', label: 'Wishlist', link: '#' },
    { icon: '🔔', label: 'Alerts', link: '#' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f2' }}>
      <div className="container" style={{ padding: '24px 16px', maxWidth: 900 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Your Account</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Profile Card */}
          <div style={{ background: 'white', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FF9900, #e47911)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
                <div style={{ color: '#666', fontSize: 14 }}>{user?.email}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' }}>
                  {user?.role} Account • Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              <button onClick={() => setEditing(!editing)}
                style={{ padding: '8px 20px', background: editing ? '#f5f5f5' : 'linear-gradient(to bottom, #f7dfa5, #f0c14b)', border: '1px solid #a88734', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {editing ? 'Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            {editing ? (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Edit Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Address Line</label>
                    <input value={form.address.line1} onChange={e => setForm(f => ({ ...f, address: { ...f.address, line1: e.target.value } }))} style={inputStyle} placeholder="House no, Street" />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>City</label>
                    <input value={form.address.city} onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>PIN Code</label>
                    <input value={form.address.pincode} onChange={e => setForm(f => ({ ...f, address: { ...f.address, pincode: e.target.value } }))} style={inputStyle} />
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                  style={{ marginTop: 16, padding: '10px 28px', background: 'linear-gradient(to bottom, #f0a070, #e47911)', border: '1px solid #c45500', color: 'white', borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InfoField label="Email Address" value={user?.email} />
                <InfoField label="Account Type" value={user?.role} style={{ textTransform: 'capitalize' }} />
                {user?.address?.line1 && (
                  <InfoField label="Address" value={`${user.address.line1}, ${user.address.city || ''} ${user.address.pincode || ''}`} style={{ gridColumn: '1/-1' }} />
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          {stats.map(s => (
            <Link key={s.label} to={s.link} style={{ background: 'white', borderRadius: 10, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', textDecoration: 'none', color: '#111', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', border: '1px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#FF9900'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'transparent'; }}>
              <span style={{ fontSize: 36 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>View {s.label.toLowerCase()}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, style }) => (
  <div style={style}>
    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 15, color: '#111' }}>{value || '—'}</div>
  </div>
);

export default ProfilePage;
